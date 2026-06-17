import type { Metadata } from "next";
import { listProducts } from "@/lib/services/products";
import { ProductGrid } from "@/components/products/product-grid";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}"` : "Search",
    description: q ? `Find ${q} at Vailmora.` : "Search the Vailmora catalog.",
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const result = q
    ? await listProducts({ search: q, limit: 24 })
    : { items: [], total: 0, page: 1, limit: 24, pages: 1 };

  return (
    <div className="container-x py-8">
      <h1 className="font-serif text-3xl">Search results</h1>
      {q ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {result.total} results for <strong>“{q}”</strong>
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">Type in the search bar to find products.</p>
      )}

      <div className="mt-8">
        <ProductGrid products={result.items} />
      </div>
    </div>
  );
}
