import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPrice, toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} most recent orders</p>
      </header>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                    {o.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <p>{o.user?.name ?? o.guestEmail ?? "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{o.user?.email ?? o.guestEmail}</p>
                </TableCell>
                <TableCell>{formatDate(o.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={o.paymentStatus === "PAID" ? "success" : "outline"}>
                    {o.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge>{o.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{formatPrice(toNumber(o.total))}</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
