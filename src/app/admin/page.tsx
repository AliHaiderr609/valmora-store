import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { StatsCards } from "@/components/admin/stats-cards";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, toNumber } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await auth();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    totalCustomers,
    totalProducts,
    revenueAgg,
    monthlyRevenueAgg,
    recentOrders,
    lowStockProducts,
    topProducts,
    ordersByDay,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, status: "ACTIVE" },
      take: 8,
      orderBy: { stock: "asc" },
      select: { id: true, title: true, slug: true, stock: true },
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { soldCount: "desc" },
      select: { id: true, title: true, soldCount: true, slug: true, price: true },
    }),
    prisma.$queryRaw<{ day: Date; total: number; count: bigint }[]>`
      SELECT
        DATE_TRUNC('day', "createdAt") AS day,
        SUM("total")::float AS total,
        COUNT(*) AS count
      FROM "Order"
      WHERE "createdAt" >= ${thirtyDaysAgo} AND "paymentStatus" = 'PAID'
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  ]);

  const chartData = ordersByDay.map((d) => ({
    day: d.day.toISOString().slice(5, 10),
    total: Number(d.total ?? 0),
    count: Number(d.count),
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Here's what's happening in your store.
        </p>
      </header>

      <StatsCards
        totalRevenue={toNumber(revenueAgg._sum.total ?? 0)}
        monthlyRevenue={toNumber(monthlyRevenueAgg._sum.total ?? 0)}
        totalOrders={totalOrders}
        totalCustomers={totalCustomers}
        totalProducts={totalProducts}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} />
        </div>

        <Card>
          <CardHeader><CardTitle>Top products</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
                    <Link href={`/admin/products/${p.id}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </div>
                  <span className="font-medium">{p.soldCount} sold</span>
                </li>
              ))}
              {topProducts.length === 0 && (
                <li className="text-sm text-muted-foreground">No sales yet.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent orders</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{o.user?.name ?? o.guestEmail ?? "Guest"}</TableCell>
                    <TableCell>{formatDate(o.createdAt)}</TableCell>
                    <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                    <TableCell className="text-right">{formatPrice(toNumber(o.total))}</TableCell>
                  </TableRow>
                ))}
                {recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Low stock alerts</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline">
                    {p.title}
                  </Link>
                  <Badge variant={p.stock === 0 ? "destructive" : "warning"}>
                    {p.stock} left
                  </Badge>
                </li>
              ))}
              {lowStockProducts.length === 0 && (
                <li className="text-sm text-muted-foreground">All products are in stock.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
