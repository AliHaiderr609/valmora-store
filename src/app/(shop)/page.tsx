import { prisma } from "@/lib/prisma";
import { listProducts } from "@/lib/services/products";
import { HeroBanner } from "@/components/home/hero-banner";
import { ValueProps } from "@/components/home/value-props";
import { CategoriesSection } from "@/components/home/categories-section";
import { ProductRow } from "@/components/home/product-row";
import { FlashSale } from "@/components/home/flash-sale";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramGallery } from "@/components/home/instagram-gallery";

export const dynamic = "force-dynamic";
 
export default async function HomePage() {
  const [banners, featured, trending, newArrivals, flashSale] = await Promise.all([
    prisma.banner
      .findMany({ where: { isActive: true, position: "home_hero" }, orderBy: { order: "asc" } })
      .catch(() => []),
    listProducts({ isFeatured: true, limit: 8 }).catch(() => ({ items: [], total: 0, page: 1, limit: 8, pages: 1 })),
    listProducts({ isTrending: true, limit: 8 }).catch(() => ({ items: [], total: 0, page: 1, limit: 8, pages: 1 })),
    listProducts({ isNew: true, limit: 8, sort: "latest" }).catch(() => ({ items: [], total: 0, page: 1, limit: 8, pages: 1 })),
    listProducts({ isFlashSale: true, limit: 8 }).catch(() => ({ items: [], total: 0, page: 1, limit: 8, pages: 1 })),
  ]);

  const flashEndsAt =
    flashSale.items
      .map((p) => p as unknown as { flashSaleEndsAt?: Date | null })
      .find((p) => p.flashSaleEndsAt)?.flashSaleEndsAt ?? null;

  return (
    <>
      <HeroBanner banners={banners.map((b) => ({ ...b, image: b.image, link: b.link, cta: b.cta }))} />
      <ValueProps />
      <CategoriesSection />

      {flashSale.items.length > 0 && (
        <FlashSale products={flashSale.items} endsAt={flashEndsAt} />
      )}

      <ProductRow
        eyebrow="Hand-picked"
        title="Featured Pieces"
        description="A curated selection of our most-loved styles, made to last."
        href="/products?isFeatured=true"
        products={featured.items}
      />

      <ProductRow
        eyebrow="What's hot"
        title="Trending Now"
        description="The pieces our community can't get enough of."
        href="/products?isTrending=true"
        products={trending.items}
      />

      <ProductRow
        eyebrow="Just dropped"
        title="New Arrivals"
        description="Fresh from the design studio — be the first to wear them."
        href="/products?isNew=true"
        products={newArrivals.items}
      />

      <Testimonials />
      <InstagramGallery />
    </>
  );
}
