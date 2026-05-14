import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "@/components/admin/categories-client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Categories</h1>
        <p className="text-sm text-muted-foreground">{categories.length} total</p>
      </header>
      <CategoriesClient
        initial={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          gender: c.gender,
          isActive: c.isActive,
          order: c.order,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
