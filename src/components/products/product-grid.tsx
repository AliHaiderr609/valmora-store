import { ProductCard } from "@/components/products/product-card";
import type { ProductListItem } from "@/types";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center">
        <p className="text-lg font-medium">No products found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
