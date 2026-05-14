import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPrice, toNumber } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, shippingAddress: true, payments: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="text-sm text-muted-foreground hover:underline">
        ← All orders
      </Link>

      <div className="rounded-xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">{order.orderNumber}</h2>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge>{order.status}</Badge>
            <Badge variant="outline">{order.paymentStatus}</Badge>
          </div>
        </div>

        {order.trackingNumber && (
          <p className="mt-4 text-sm">
            <strong>Tracking:</strong> {order.carrier ?? "Carrier"} —{" "}
            <span className="font-mono">{order.trackingNumber}</span>
          </p>
        )}

        <Separator className="my-6" />

        <ul className="space-y-4">
          {order.items.map((i) => (
            <li key={i.id} className="flex gap-3">
              <div className="relative h-20 w-16 overflow-hidden rounded-md border bg-muted">
                {i.image && (
                  <Image src={i.image} alt={i.title} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{i.title}</p>
                <p className="text-xs text-muted-foreground">
                  Qty {i.quantity} · {[i.size, i.color].filter(Boolean).join(" · ")}
                </p>
              </div>
              <p className="font-medium">{formatPrice(toNumber(i.subtotal))}</p>
            </li>
          ))}
        </ul>

        <Separator className="my-6" />

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shipping address
            </p>
            {order.shippingAddress ? (
              <address className="mt-2 not-italic text-sm leading-relaxed">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </address>
            ) : (
              <p className="text-sm text-muted-foreground">No address on file.</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Summary
            </p>
            <dl className="mt-2 space-y-1 text-sm">
              <Row label="Subtotal" value={formatPrice(toNumber(order.subtotal))} />
              {toNumber(order.discount) > 0 && (
                <Row label="Discount" value={`-${formatPrice(toNumber(order.discount))}`} />
              )}
              <Row label="Shipping" value={formatPrice(toNumber(order.shipping))} />
              <Row label="Tax" value={formatPrice(toNumber(order.tax))} />
              <Separator className="my-2" />
              <Row label="Total" value={formatPrice(toNumber(order.total))} bold />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-semibold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
