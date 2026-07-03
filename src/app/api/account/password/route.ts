import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err, handleError, ok } from "@/lib/api";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return err("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return err("Password change is not available for accounts signed in with Google.", 400);
    }

    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const isCorrect = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCorrect) return err("Current password is incorrect.", 400);

    if (currentPassword === newPassword) {
      return err("New password must be different from the current password.", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return ok({ message: "Password updated successfully." });
  } catch (error) {
    return handleError(error);
  }
}
