import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bannerSchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";

async function requireStaff() {
  const session = await auth();
  return session?.user && (session.user.role === "ADMIN" || session.user.role === "STAFF");
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;
    const data = bannerSchema.partial().parse(await req.json());

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return err("Banner not found", 404);

    const banner = await prisma.banner.update({ where: { id }, data });
    return ok(banner);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return err("Banner not found", 404);

    await prisma.banner.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
