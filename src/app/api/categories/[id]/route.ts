import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";

async function requireStaff() {
  const session = await auth();
  return session?.user && (session.user.role === "ADMIN" || session.user.role === "STAFF");
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;
    const body = await req.json();
    const data = categorySchema.partial().parse(body);
    const cat = await prisma.category.update({ where: { id }, data });
    return ok(cat);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
