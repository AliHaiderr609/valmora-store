import Link from "next/link";
import { Plus, Eye, MessageSquare } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: p } = await searchParams;
  const page = Math.max(1, Number(p ?? 1));
  const limit = 20;

  const where = q
    ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
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

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Journal</h1>
          <p className="text-sm text-muted-foreground">{total} posts</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" /> New post
          </Link>
        </Button>
      </header>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search posts…"
          className="h-10 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> Views
                </span>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> Comments
                </span>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium max-w-[240px] truncate">
                  {post.title}
                </TableCell>
                <TableCell>
                  {post.category ? (
                    <span className="text-sm">{post.category.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {post.author.name ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={post.isPublished ? "success" : "secondary"}>
                    {post.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(post.publishedAt ?? post.createdAt)}
                </TableCell>
                <TableCell className="text-sm">{post.views.toLocaleString()}</TableCell>
                <TableCell className="text-sm">{post._count.comments}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-sm underline-offset-4 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No posts yet.{" "}
                  <Link href="/admin/blog/new" className="underline">
                    Write your first post.
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <nav className="flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            params.set("page", String(i + 1));
            return (
              <Button
                key={i}
                asChild
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
              >
                <Link href={`/admin/blog?${params.toString()}`}>{i + 1}</Link>
              </Button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
