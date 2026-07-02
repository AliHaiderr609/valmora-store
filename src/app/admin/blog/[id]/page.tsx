import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        tags: true,
        categoryId: true,
        isPublished: true,
        publishedAt: true,
        seoTitle: true,
        seoDesc: true,
      },
    }),
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl line-clamp-1">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          /blog/{post.slug}
        </p>
      </header>

      <BlogPostForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImage: post.coverImage,
          tags: post.tags,
          categoryId: post.categoryId,
          isPublished: post.isPublished,
          publishedAt: post.publishedAt?.toISOString() ?? null,
          seoTitle: post.seoTitle ?? "",
          seoDesc: post.seoDesc ?? "",
        }}
        categories={categories}
      />
    </div>
  );
}
