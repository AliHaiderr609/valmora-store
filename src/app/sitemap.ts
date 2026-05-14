import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const staticRoutes = [
    "",
    "/men",
    "/women",
    "/boys",
    "/products",
    "/blog",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const [products, categories] = await Promise.all([
    prisma.product
      .findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } })
      .catch(() => []),
    prisma.category
      .findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } })
      .catch(() => []),
  ]);

  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
