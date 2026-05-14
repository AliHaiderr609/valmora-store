import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">New product</h1>
        <p className="text-sm text-muted-foreground">Add a new piece to your catalog.</p>
      </header>

      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
