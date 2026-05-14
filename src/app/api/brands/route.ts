import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { brandSchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return ok(brands);
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
    const data = brandSchema.parse(body);
    const slug = data.slug && data.slug.length > 0 ? slugify(data.slug) : slugify(data.name);
    const brand = await prisma.brand.create({ data: { ...data, slug } });
    return ok(brand);
  } catch (e) {
    return handleError(e);
  }
}
