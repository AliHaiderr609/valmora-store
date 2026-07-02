import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, handleError } from "@/lib/api";
import { slugify } from "@/lib/utils";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return null;
  }
  return session;
}

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDesc: z.string().nullable().optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { category: true, author: { select: { name: true } } },
    });
    if (!post) return err("Not found", 404);
    return ok(post);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;

    const existing = await prisma.blogPost.findUnique({ where: { id }, select: { id: true, isPublished: true, publishedAt: true } });
    if (!existing) return err("Not found", 404);

    const body = await req.json();
    const data = patchSchema.parse(body);

    const slug = data.slug?.trim() ? slugify(data.slug) : undefined;

    // If slug changed, check uniqueness
    if (slug) {
      const conflict = await prisma.blogPost.findFirst({ where: { slug, NOT: { id } }, select: { id: true } });
      if (conflict) return err("A post with this slug already exists.", 409);
    }

    const publishedAt =
      data.isPublished === true && !existing.publishedAt
        ? (data.publishedAt ? new Date(data.publishedAt) : new Date())
        : data.publishedAt
        ? new Date(data.publishedAt)
        : data.publishedAt === null
        ? null
        : undefined;

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(slug && { slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(publishedAt !== undefined && { publishedAt }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDesc !== undefined && { seoDesc: data.seoDesc }),
      },
    });

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
