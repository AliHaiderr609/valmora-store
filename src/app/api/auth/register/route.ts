import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`register:${getClientIp(req)}`, { limit: 5, windowMs: 60_000 });
    if (!limit.ok) return err("Too many attempts. Try again shortly.", 429);

    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return err("An account with this email already exists.", 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "CUSTOMER" },
      select: { id: true, email: true, name: true },
    });

    return ok(user, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
