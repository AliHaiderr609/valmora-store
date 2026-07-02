import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Eye, Tag } from "lucide-react";

import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/services/blog";
import { BlogComments } from "@/components/blog/blog-comments";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) return { title: "Post not found" };

  return {
    title: post.seoTitle ?? `${post.title} — ${SITE.name} Journal`,
    description: post.seoDesc ?? post.excerpt ?? post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt ?? "",
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  const related = await getRelatedBlogPosts(post.id, null, 3).catch(() => []);
  const date = post.publishedAt ?? post.createdAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? "",
    image: post.coverImage ?? undefined,
    datePublished: date.toISOString(),
    dateModified: date.toISOString(),
    author: { "@type": "Person", name: post.author.name ?? "Vailmora Team" },
    publisher: { "@type": "Organization", name: SITE.name },
  };

  return (
    <div className="container-x py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-foreground">Journal</Link>
        <span className="mx-2">/</span>
        <span className="line-clamp-1 text-foreground">{post.title}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        {/* Category */}
        {post.category && (
          <Link href={`/blog?category=${post.category.slug}`}>
            <Badge variant="secondary" className="mb-4">
              {post.category.name}
            </Badge>
          </Link>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl leading-tight md:text-5xl">{post.title}</h1>

        {/* Meta row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-b pb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name ?? "Author"}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold uppercase">
                {(post.author.name ?? "A").charAt(0)}
              </div>
            )}
            <span className="font-medium text-foreground">
              {post.author.name ?? "Vailmora Team"}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.views.toLocaleString()} views
          </span>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-neutral dark:prose-invert mt-10 max-w-none prose-headings:font-serif prose-a:text-gold-600 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-6">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Comments */}
        <div className="mt-16 border-t pt-10">
          <BlogComments postId={post.id} initialComments={post.comments} />
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mt-20 border-t pt-12">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Continue reading
            </p>
            <h2 className="mt-2 font-serif text-3xl">More from the Journal</h2>
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogPostCard key={p.id} post={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="text-sm font-medium underline underline-offset-4 hover:text-gold-600"
            >
              View all posts →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
