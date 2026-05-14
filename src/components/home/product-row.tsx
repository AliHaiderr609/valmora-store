import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/home/section-heading";
import type { ProductListItem } from "@/types";

export function ProductRow({
  title,
  eyebrow,
  description,
  href,
  products,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  href?: string;
  products: ProductListItem[];
}) {
  if (!products.length) return null;
  return (
    <section className="container-x py-16">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} href={href} />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
