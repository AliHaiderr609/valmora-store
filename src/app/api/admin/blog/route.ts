import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, handleError, parsePagination } from "@/lib/api";
import { slugify } from "@/lib/utils";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return null;
  }
  return session;
}

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await requireStaff();
    if (!session) return err("Unauthorized", 401);

    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url.searchParams);
    const q = url.searchParams.get("q") ?? "";

    const where = q
      ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }] }
      : {};

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          views: true,
          category: { select: { name: true } },
          author: { select: { name: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return ok({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaff();
    if (!session) return err("Unauthorized", 401);

    const body = await req.json();
    const data = postSchema.parse(body);

    const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);

    const existing = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (existing) return err("A post with this slug already exists.", 409);

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt ?? null,
        content: data.content,
        coverImage: data.coverImage ?? null,
        tags: data.tags,
        categoryId: data.categoryId || null,
        authorId: session.user.id,
        isPublished: data.isPublished,
        publishedAt: data.isPublished
          ? data.publishedAt
            ? new Date(data.publishedAt)
            : new Date()
          : null,
        seoTitle: data.seoTitle ?? null,
        seoDesc: data.seoDesc ?? null,
      },
    });

    return ok(post);
  } catch (e) {
    return handleError(e);
  }
}
