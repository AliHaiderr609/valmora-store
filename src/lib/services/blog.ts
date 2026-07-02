import { prisma } from "@/lib/prisma";

export type BlogPostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  publishedAt: Date | null;
  createdAt: Date;
  views: number;
  readingTime: number;
  author: { name: string | null; image: string | null };
  category: { name: string; slug: string } | null;
};

export type BlogPostDetail = BlogPostListItem & {
  content: string;
  seoTitle: string | null;
  seoDesc: string | null;
  comments: {
    id: string;
    content: string;
    createdAt: Date;
    user: { name: string | null; image: string | null };
  }[];
};

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const postListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  tags: true,
  publishedAt: true,
  createdAt: true,
  views: true,
  content: true,
  author: { select: { name: true, image: true } },
  category: { select: { name: true, slug: true } },
} as const;

function mapListItem(p: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  publishedAt: Date | null;
  createdAt: Date;
  views: number;
  content: string;
  author: { name: string | null; image: string | null };
  category: { name: string; slug: string } | null;
}): BlogPostListItem {
  return {
    ...p,
    readingTime: calcReadingTime(p.content),
    content: undefined as never,
  };
}

export async function listBlogPosts(opts?: {
  categorySlug?: string;
  tag?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, opts?.page ?? 1);
  const limit = Math.min(24, Math.max(1, opts?.limit ?? 9));
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
    ...(opts?.tag ? { tags: { has: opts.tag } } : {}),
  };

  const [raw, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      select: postListSelect,
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    items: raw.map(mapListItem),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
    select: {
      ...postListSelect,
      seoTitle: true,
      seoDesc: true,
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
  });
  if (!post) return null;

  // Increment views (fire-and-forget)
  prisma.blogPost.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => null);

  return {
    ...post,
    readingTime: calcReadingTime(post.content),
    author: post.author,
    category: post.category,
    comments: post.comments,
  };
}

export async function getBlogCategories() {
  return prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getRelatedBlogPosts(
  postId: string,
  categoryId: string | null,
  limit = 3
): Promise<BlogPostListItem[]> {
  const raw = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      id: { not: postId },
      ...(categoryId ? { categoryId } : {}),
    },
    select: postListSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return raw.map(mapListItem);
}
