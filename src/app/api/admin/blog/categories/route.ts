import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, handleError } from "@/lib/api";
import { slugify } from "@/lib/utils";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return null;
  }
  return session;
}

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
    });
    return ok(categories);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const data = categorySchema.parse(await req.json());
    const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
    const existing = await prisma.blogCategory.findUnique({ where: { slug }, select: { id: true } });
    if (existing) return err("Category slug already exists.", 409);
    const category = await prisma.blogCategory.create({ data: { name: data.name, slug } });
    return ok(category);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await req.json();
    if (!id) return err("id is required", 400);
    await prisma.blogCategory.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
