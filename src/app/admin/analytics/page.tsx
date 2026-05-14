import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [byCategory, byGender, totalRevenue] = await Promise.all([
    prisma.$queryRaw<{ name: string; revenue: number; orders: bigint }[]>`
      SELECT c.name, SUM(oi.subtotal)::float AS revenue, COUNT(DISTINCT o.id) AS orders
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."productId"
      JOIN "Category" c ON c.id = p."categoryId"
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o."paymentStatus" = 'PAID'
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT 10
    `.catch(() => []),
    prisma.$queryRaw<{ gender: string; revenue: number }[]>`
      SELECT p.gender::text AS gender, SUM(oi.subtotal)::float AS revenue
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."productId"
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o."paymentStatus" = 'PAID'
      GROUP BY p.gender
    `.catch(() => []),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Sales performance overview across categories and demographics.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Total revenue</CardTitle></CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{formatPrice(toNumber(totalRevenue._sum.total ?? 0))}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top categories</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {byCategory.map((c, i) => (
                <li key={c.name} className="flex items-center justify-between">
                  <span className="text-sm">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">#{i + 1}</span>
                    {c.name}
                  </span>
                  <div className="text-right text-sm">
                    <p className="font-medium">{formatPrice(Number(c.revenue))}</p>
                    <p className="text-xs text-muted-foreground">{Number(c.orders)} orders</p>
                  </div>
                </li>
              ))}
              {byCategory.length === 0 && (
                <li className="text-sm text-muted-foreground">No paid orders yet.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sales by gender</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {byGender.map((g) => (
                <li key={g.gender} className="flex items-center justify-between">
                  <span className="text-sm">{g.gender}</span>
                  <p className="text-sm font-medium">{formatPrice(Number(g.revenue))}</p>
                </li>
              ))}
              {byGender.length === 0 && (
                <li className="text-sm text-muted-foreground">No data yet.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
