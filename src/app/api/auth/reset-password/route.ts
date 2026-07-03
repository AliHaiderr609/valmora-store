import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { err, handleError, ok } from "@/lib/api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`reset-pw:${getClientIp(req)}`, { limit: 10, windowMs: 60_000 });
    if (!limit.ok) return err("Too many attempts. Try again shortly.", 429);

    const body = await req.json();
    const { token, email, password } = schema.parse(body);

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const record = await prisma.verificationToken.findUnique({
      where: { token: tokenHash },
    });

    if (!record || record.identifier !== email) {
      return err("This reset link is invalid.", 400);
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token: tokenHash } });
      return err("This reset link has expired. Please request a new one.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return err("This reset link is invalid.", 400);

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.verificationToken.delete({ where: { token: tokenHash } }),
    ]);

    return ok({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    return handleError(error);
  }
}
