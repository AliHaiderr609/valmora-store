import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { err, handleError, ok } from "@/lib/api";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { SITE } from "@/lib/constants";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`forgot-pw:${getClientIp(req)}`, { limit: 5, windowMs: 60_000 });
    if (!limit.ok) return err("Too many attempts. Try again shortly.", 429);

    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    if (!user) {
      return err("No account found with that email address.", 404);
    }

    if (!user.passwordHash) {
      // No password means the account was created via Google (or another OAuth provider).
      // NextAuth JWT mode does not write to the Account table, so we can't check the provider —
      // but any passwordless account in this app is a Google account.
      return err(
        "This account was created with Google. Please sign in using 'Continue with Google' instead.",
        400
      );
    }

    // Generate a secure random token; store its SHA-256 hash
    const plainToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(plainToken).digest("hex");
    const expires = new Date(Date.now() + EXPIRY_MS);

    // One token per email at a time — delete any existing before creating
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: tokenHash, expires },
    });

    const resetUrl = `${SITE.url}/reset-password?token=${plainToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Reset your Vailmora password",
      html: passwordResetEmail({ resetUrl, name: user.name ?? undefined }),
    });

    return ok({ message: "Reset link sent. Check your inbox — it expires in 1 hour." });
  } catch (error) {
    return handleError(error);
  }
}
