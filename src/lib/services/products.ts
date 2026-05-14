import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";
import type { ProductListItem } from "@/types";

export type ProductQuery = {
  gender?: "MEN" | "WOMEN" | "BOYS" | "UNISEX";
  category?: string[];
  brand?: string[];
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  onSale?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isFlashSale?: boolean;
  sort?: "latest" | "price-asc" | "price-desc" | "best-selling" | "rating";
  page?: number;
  limit?: number;
};

const productSelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  salePrice: true,
  rating: true,
  reviewCount: true,
  isFeatured: true,
  isTrending: true,
  isFlashSale: true,
  stock: true,
  gender: true,
  sizes: true,
  colors: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: { orderBy: { order: "asc" as const }, select: { url: true, alt: true } },
} satisfies Prisma.ProductSelect;

export async function listProducts(q: ProductQuery) {
  const page = Math.max(1, q.page ?? 1);
  const limit = Math.min(60, Math.max(1, q.limit ?? 12));
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(q.gender ? { gender: q.gender } : {}),
    ...(q.category?.length ? { category: { slug: { in: q.category } } } : {}),
    ...(q.brand?.length ? { brand: { slug: { in: q.brand } } } : {}),
    ...(q.size?.length ? { sizes: { hasSome: q.size } } : {}),
    ...(q.color?.length ? { colors: { hasSome: q.color } } : {}),
    ...(q.isFeatured ? { isFeatured: true } : {}),
    ...(q.isTrending ? { isTrending: true } : {}),
    ...(q.isFlashSale ? { isFlashSale: true } : {}),
    ...(q.inStock ? { stock: { gt: 0 } } : {}),
    ...(q.onSale ? { salePrice: { not: null } } : {}),
    ...(q.isNew
      ? {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        }
      : {}),
    ...(q.minPrice != null || q.maxPrice != null
      ? {
          price: {
            ...(q.minPrice != null ? { gte: q.minPrice } : {}),
            ...(q.maxPrice != null ? { lte: q.maxPrice } : {}),
          },
        }
      : {}),
    ...(q.search
      ? {
          OR: [
            { title: { contains: q.search, mode: "insensitive" } },
            { description: { contains: q.search, mode: "insensitive" } },
            { sku: { contains: q.search, mode: "insensitive" } },
            { tags: { has: q.search.toLowerCase() } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (q.sort) {
      case "price-asc":
        return { price: "asc" };
      case "price-desc":
        return { price: "desc" };
      case "best-selling":
        return { soldCount: "desc" };
      case "rating":
        return { rating: "desc" };
      default:
        return { createdAt: "desc" };
    }
  })();

  const [rawItems, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productSelect,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const items: ProductListItem[] = rawItems.map((p) => ({
    ...p,
    price: toNumber(p.price),
    salePrice: p.salePrice ? toNumber(p.salePrice) : null,
  }));

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: "asc" } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
  return p;
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 8) {
  const items = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      status: "ACTIVE",
    },
    select: productSelect,
    orderBy: { soldCount: "desc" },
    take: limit,
  });
  return items.map((p) => ({
    ...p,
    price: toNumber(p.price),
    salePrice: p.salePrice ? toNumber(p.salePrice) : null,
  })) as ProductListItem[];
}

export function parseProductQuery(sp: URLSearchParams): ProductQuery {
  const list = (k: string) => sp.get(k)?.split(",").filter(Boolean);
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  return {
    search: sp.get("q") ?? sp.get("search") ?? undefined,
    category: list("category"),
    brand: list("brand"),
    size: list("size"),
    color: list("color"),
    gender: (sp.get("gender") as ProductQuery["gender"]) ?? undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    onSale: sp.get("onSale") === "true",
    isNew: sp.get("isNew") === "true",
    inStock: sp.get("inStock") === "true",
    isFeatured: sp.get("isFeatured") === "true",
    isTrending: sp.get("isTrending") === "true",
    isFlashSale: sp.get("isFlashSale") === "true",
    sort: (sp.get("sort") as ProductQuery["sort"]) ?? undefined,
    page: num("page"),
    limit: num("limit"),
  };
}
