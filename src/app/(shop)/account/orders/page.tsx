import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, toNumber } from "@/lib/utils";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-lg">You haven't placed any orders yet.</p>
        <Link href="/products" className="mt-3 inline-block underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="rounded-xl border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div>
              <p className="font-semibold">{o.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                Placed on {formatDate(o.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
              <Badge variant="outline">{o.paymentStatus}</Badge>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <ul className="flex flex-wrap gap-2">
              {o.items.slice(0, 5).map((i) => (
                <li
                  key={i.id}
                  className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted"
                  title={i.title}
                >
                  {i.image && (
                    <Image src={i.image} alt={i.title} fill sizes="48px" className="object-cover" />
                  )}
                </li>
              ))}
              {o.items.length > 5 && (
                <li className="flex h-12 w-12 items-center justify-center rounded-md border text-xs">
                  +{o.items.length - 5}
                </li>
              )}
            </ul>
            <div className="text-right">
              <p className="font-semibold">{formatPrice(toNumber(o.total))}</p>
              <Link href={`/account/orders/${o.id}`} className="text-sm underline">
                View details
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function statusVariant(s: string) {
  if (s === "DELIVERED") return "success" as const;
  if (s === "CANCELLED" || s === "REFUNDED") return "destructive" as const;
  if (s === "SHIPPED") return "warning" as const;
  return "secondary" as const;
}
