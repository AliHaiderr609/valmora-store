import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err, handleError, ok } from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().max(30).optional().nullable(),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return err("Unauthorized", 401);

    const body = await req.json();
    const { name, phone } = profileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone: phone ?? null },
      select: { id: true, name: true, email: true, phone: true, image: true },
    });

    return ok(user);
  } catch (error) {
    return handleError(error);
  }
}
