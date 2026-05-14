import { prisma } from "@/lib/prisma";
import { handleError, ok } from "@/lib/api";
import { toNumber } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    if (!q) return ok({ products: [], categories: [], brands: [] });

    const [products, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { tags: { has: q.toLowerCase() } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 8,
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          salePrice: true,
          images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
        },
      }),
      prisma.category.findMany({
        where: { isActive: true, name: { contains: q, mode: "insensitive" } },
        take: 5,
        select: { id: true, name: true, slug: true },
      }),
      prisma.brand.findMany({
        where: { isActive: true, name: { contains: q, mode: "insensitive" } },
        take: 5,
        select: { id: true, name: true, slug: true },
      }),
    ]);

    return ok({
      products: products.map((p) => ({
        ...p,
        price: toNumber(p.price),
        salePrice: p.salePrice ? toNumber(p.salePrice) : null,
      })),
      categories,
      brands,
    });
  } catch (e) {
    return handleError(e);
  }
}
