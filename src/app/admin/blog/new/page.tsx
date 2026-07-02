import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">New post</h1>
        <p className="text-sm text-muted-foreground">Write a new Journal entry.</p>
      </header>

      <BlogPostForm categories={categories} />
    </div>
  );
}
