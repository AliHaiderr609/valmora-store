import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { queueNewsletterEmail, sendNewsletterWelcomeEmail } from "@/lib/newsletter-email";

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`newsletter:${getClientIp(req)}`, { limit: 5, windowMs: 60_000 });
    if (!limit.ok) return err("Too many requests", 429);

    const { email } = newsletterSchema.parse(await req.json());
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email },
    });

    if (!existing?.isActive) {
      queueNewsletterEmail(() => sendNewsletterWelcomeEmail(email), "welcome email");
    }

    return ok({ subscribed: true });
  } catch (e) {
    return handleError(e);
  }
}
