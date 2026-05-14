import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const gender = url.searchParams.get("gender");
    const where = gender ? { isActive: true, gender: gender as any } : { isActive: true };
    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
        children: { where: { isActive: true } },
      },
    });
    return ok(categories);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return err("Unauthorized", 401);
    }
    const body = await req.json();
    const data = categorySchema.parse(body);
    const slug = data.slug && data.slug.length > 0 ? slugify(data.slug) : slugify(data.name);
    const category = await prisma.category.create({
      data: { ...data, slug },
    });
    return ok(category);
  } catch (e) {
    return handleError(e);
  }
}
