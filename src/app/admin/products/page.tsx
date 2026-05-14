import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: p } = await searchParams;
  const page = Math.max(1, Number(p ?? 1));
  const limit = 20;

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { sku: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, images: { take: 1, orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground">{total} products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new"><Plus className="h-4 w-4" /> Add product</Link>
        </Button>
      </header>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="h-10 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
        />
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 overflow-hidden rounded border bg-muted">
                      {p.images[0]?.url && (
                        <Image src={p.images[0].url} alt={p.title} fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.sku}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{p.category.name}</TableCell>
                <TableCell>
                  {p.salePrice ? (
                    <span>
                      {formatPrice(toNumber(p.salePrice))}{" "}
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(toNumber(p.price))}
                      </span>
                    </span>
                  ) : (
                    formatPrice(toNumber(p.price))
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={p.stock === 0 ? "destructive" : p.stock <= 5 ? "warning" : "outline"}>
                    {p.stock}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.status === "ACTIVE" ? "success" : p.status === "DRAFT" ? "secondary" : "outline"
                    }
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-sm underline-offset-4 hover:underline">
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
