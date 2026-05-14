import Link from "next/link";
import type { Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { listProducts, parseProductQuery } from "@/lib/services/products";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { Button } from "@/components/ui/button";

export async function GenderListingPage({
  gender,
  title,
  description,
  searchParams,
}: {
  gender: Gender;
  title: string;
  description: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) usp.set(k, v.join(","));
    else if (v) usp.set(k, v);
  }
  const query = { ...parseProductQuery(usp), gender };

  const [{ items, total, page, pages }, categories, brands] = await Promise.all([
    listProducts(query),
    prisma.category.findMany({
      where: { isActive: true, gender, parentId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="container-x py-8">
      <header className="mb-8 border-b pb-6">
        <h1 className="font-serif text-3xl md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
        <p className="mt-3 text-xs text-muted-foreground">{total} products</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <ProductFilters categories={categories} brands={brands} gender={gender} />
        <div>
          <ProductGrid products={items} />
          {pages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: pages }).map((_, i) => {
                const np = new URLSearchParams(usp);
                np.set("page", String(i + 1));
                return (
                  <Button
                    key={i}
                    asChild
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                  >
                    <Link href={`?${np.toString()}`}>{i + 1}</Link>
                  </Button>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
