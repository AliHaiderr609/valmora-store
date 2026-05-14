import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatPrice, toNumber } from "@/lib/utils";

export default async function AccountOverviewPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [orderCount, recentOrders, wishlistCount] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: { take: 1 } },
    }),
    prisma.wishlistItem.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{orderCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Wishlist</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{wishlistCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Member since</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{formatDate(new Date())}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)} · {o.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(toNumber(o.total))}</p>
                    <Link
                      href={`/account/orders/${o.id}`}
                      className="text-xs underline-offset-4 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
