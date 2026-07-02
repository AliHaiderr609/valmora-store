import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { listBlogPosts, getBlogCategories } from "@/lib/services/blog";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlogPostListItem } from "@/lib/services/blog";

const DUMMY_POSTS: BlogPostListItem[] = [
  {
    id: "demo-1",
    title: "How to Build a Capsule Wardrobe That Lasts a Decade",
    slug: "#",
    excerpt:
      "Fewer pieces, more style. We break down the 10 essential items every wardrobe needs and show you how to make them work for every season.",
    coverImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    tags: ["style", "capsule-wardrobe"],
    publishedAt: new Date("2026-06-10"),
    createdAt: new Date("2026-06-10"),
    views: 1243,
    readingTime: 6,
    author: { name: "Vailmora Team", image: null },
    category: { name: "Style Guides", slug: "style-guides" },
  },
  {
    id: "demo-2",
    title: "Behind the Seams: Our Autumn Collection Process",
    slug: "#",
    excerpt:
      "From initial sketch to final stitch — follow our designers through six months of fabric sourcing, fitting, and refinement for the new Autumn drop.",
    coverImage:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
    tags: ["atelier", "behind-the-scenes"],
    publishedAt: new Date("2026-05-22"),
    createdAt: new Date("2026-05-22"),
    views: 874,
    readingTime: 4,
    author: { name: "Vailmora Team", image: null },
    category: { name: "Atelier Stories", slug: "atelier-stories" },
  },
  {
    id: "demo-3",
    title: "5 Ways to Style Our Merino Wool Coat This Winter",
    slug: "#",
    excerpt:
      "One coat, five completely different looks. Our stylists show you how to take a single investment piece from boardroom to weekend brunch.",
    coverImage:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    tags: ["styling", "winter"],
    publishedAt: new Date("2026-05-05"),
    createdAt: new Date("2026-05-05"),
    views: 2101,
    readingTime: 5,
    author: { name: "Vailmora Team", image: null },
    category: { name: "Style Guides", slug: "style-guides" },
  },
];

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Journal — ${SITE.name}`,
  description:
    "Stories, style guides, and inspiration from the Vailmora atelier. Explore our Journal.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const [{ items, total, pages }, categories] = await Promise.all([
    listBlogPosts({ categorySlug: category, page }).catch(() => ({
      items: [],
      total: 0,
      page: 1,
      pages: 1,
    })),
    getBlogCategories().catch(() => []),
  ]);

  return (
    <div className="container-x py-12">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Our Journal
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">
          Stories worth wearing
        </h1>
        <p className="mt-4 text-muted-foreground">
          Style guides, behind-the-scenes atelier stories, and inspiration to help you dress with
          intention.
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <Button
            asChild
            variant={!category ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            <Link href="/blog">All</Link>
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              asChild
              variant={category === c.slug ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              <Link href={`/blog?category=${c.slug}`}>{c.name}</Link>
            </Button>
          ))}
        </div>
      )}

      {/* Posts grid */}
      <div className="mt-12">
        {items.length === 0 ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Coming soon — here&apos;s a preview of what&apos;s on its way.
            </p>
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 opacity-60 pointer-events-none select-none">
              {DUMMY_POSTS.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {total} {total === 1 ? "post" : "posts"}
              {category && ` in "${categories.find((c) => c.slug === category)?.name ?? category}"`}
            </p>
            <div
              className={cn(
                "grid gap-x-8 gap-y-14",
                items.length === 1
                  ? "max-w-lg"
                  : "sm:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {items.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <nav className="mt-16 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => {
            const params = new URLSearchParams();
            if (category) params.set("category", category);
            params.set("page", String(i + 1));
            return (
              <Button
                key={i}
                asChild
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
              >
                <Link href={`/blog?${params.toString()}`}>{i + 1}</Link>
              </Button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
