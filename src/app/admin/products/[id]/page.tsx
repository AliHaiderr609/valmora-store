import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { toNumber } from "@/lib/utils";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">{product.title}</h1>
        <p className="text-sm text-muted-foreground">SKU {product.sku}</p>
      </header>

      <ProductForm
        initial={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription ?? "",
          sku: product.sku,
          price: toNumber(product.price),
          salePrice: product.salePrice ? toNumber(product.salePrice) : null,
          costPrice: product.costPrice ? toNumber(product.costPrice) : null,
          stock: product.stock,
          categoryId: product.categoryId,
          brandId: product.brandId,
          gender: product.gender,
          sizes: product.sizes,
          colors: product.colors,
          tags: product.tags,
          fabric: product.fabric ?? "",
          material: product.material ?? "",
          isFeatured: product.isFeatured,
          isTrending: product.isTrending,
          isFlashSale: product.isFlashSale,
          status: product.status,
          seoTitle: product.seoTitle ?? "",
          seoDesc: product.seoDesc ?? "",
          images: product.images.map((i) => ({ url: i.url, alt: i.alt ?? undefined })),
        }}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
