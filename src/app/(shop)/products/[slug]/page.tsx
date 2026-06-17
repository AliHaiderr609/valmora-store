import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug, getRelatedProducts } from "@/lib/services/products";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductActions } from "@/components/products/product-actions";
import { ProductReviews } from "@/components/products/product-reviews";
import { ProductRow } from "@/components/home/product-row";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDesc ?? product.shortDescription ?? product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.shortDescription ?? "",
      images: product.images.map((i) => ({ url: i.url })),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 8);
  const reviews = product.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    createdAt: r.createdAt,
    user: { name: r.user.name, image: r.user.image },
  }));

  const productShape = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    sku: product.sku,
    price: toNumber(product.price),
    salePrice: product.salePrice ? toNumber(product.salePrice) : null,
    stock: product.stock,
    sizes: product.sizes,
    colors: product.colors,
    fabric: product.fabric,
    material: product.material,
    images: product.images.map((i) => ({ url: i.url })),
    brand: product.brand,
    rating: product.rating,
    reviewCount: product.reviewCount,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description.slice(0, 500),
    image: product.images.map((i) => i.url),
    sku: product.sku,
    brand: product.brand?.name ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: process.env.NEXT_PUBLIC_CURRENCY ?? "PKR",
      price: toNumber(product.salePrice ?? product.price),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  return (
    <div className="container-x py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${product.gender.toLowerCase()}`} className="hover:text-foreground">
          {product.gender.charAt(0) + product.gender.slice(1).toLowerCase()}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />
        <ProductActions product={productShape} />
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Description</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
            {product.description}
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {product.fabric && (
              <div className="flex justify-between border-b py-2">
                <dt className="text-muted-foreground">Fabric</dt>
                <dd>{product.fabric}</dd>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between border-b py-2">
                <dt className="text-muted-foreground">Material</dt>
                <dd>{product.material}</dd>
              </div>
            )}
            <div className="flex justify-between border-b py-2">
              <dt className="text-muted-foreground">SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            <div className="flex justify-between border-b py-2">
              <dt className="text-muted-foreground">Category</dt>
              <dd>{product.category.name}</dd>
            </div>
            {product.brand && (
              <div className="flex justify-between border-b py-2">
                <dt className="text-muted-foreground">Brand</dt>
                <dd>{product.brand.name}</dd>
              </div>
            )}
            {product.tags.length > 0 && (
              <div className="flex justify-between border-b py-2">
                <dt className="text-muted-foreground">Tags</dt>
                <dd>{product.tags.join(", ")}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-16">
        <ProductReviews
          productId={product.id}
          initialReviews={reviews}
          averageRating={product.rating}
          reviewCount={product.reviewCount}
        />
      </div>

      {related.length > 0 && (
        <ProductRow title="You may also like" products={related} />
      )}
    </div>
  );
}
