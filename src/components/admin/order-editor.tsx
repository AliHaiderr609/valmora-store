"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, formatPrice, toNumber } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  total: string | number;
  subtotal: string | number;
  discount: string | number;
  shipping: string | number;
  tax: string | number;
  createdAt: string;
  trackingNumber: string | null;
  carrier: string | null;
  notes: string | null;
  guestEmail: string | null;
  user: { name: string | null; email: string } | null;
  items: Array<{
    id: string;
    title: string;
    image: string | null;
    sku: string;
    price: string | number;
    quantity: number;
    size: string | null;
    color: string | null;
    subtotal: string | number;
  }>;
  shippingAddress: any;
};

export function OrderEditor({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(order.status);
  const [paymentStatus, setPaymentStatus] = React.useState(order.paymentStatus);
  const [tracking, setTracking] = React.useState(order.trackingNumber ?? "");
  const [carrier, setCarrier] = React.useState(order.carrier ?? "");
  const [saving, setSaving] = React.useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus,
          trackingNumber: tracking || undefined,
          carrier: carrier || undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      toast.success("Order updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:underline">
            ← All orders
          </Link>
          <h1 className="mt-1 font-serif text-3xl">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Badge>{order.status}</Badge>
          <Badge variant="outline">{order.paymentStatus}</Badge>
          <Badge variant="secondary">{order.paymentMethod}</Badge>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y">
                {order.items.map((i) => (
                  <li key={i.id} className="flex gap-3 py-3">
                    <div className="relative h-16 w-12 overflow-hidden rounded border bg-muted">
                      {i.image && (
                        <Image src={i.image} alt={i.title} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="font-medium">{i.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.sku} · Qty {i.quantity} · {[i.size, i.color].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(toNumber(i.subtotal))}</p>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <dl className="space-y-1 text-sm">
                <Row label="Subtotal" value={formatPrice(toNumber(order.subtotal))} />
                {toNumber(order.discount) > 0 && (
                  <Row label="Discount" value={`-${formatPrice(toNumber(order.discount))}`} />
                )}
                <Row label="Shipping" value={formatPrice(toNumber(order.shipping))} />
                <Row label="Tax" value={formatPrice(toNumber(order.tax))} />
                <Separator className="my-2" />
                <Row label="Total" value={formatPrice(toNumber(order.total))} bold />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium">{order.user?.name ?? "Guest"}</p>
              <p className="text-sm text-muted-foreground">{order.user?.email ?? order.guestEmail}</p>
              {order.shippingAddress && (
                <address className="mt-4 not-italic text-sm text-foreground/80">
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.line1}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                  <br />
                  {order.shippingAddress.phone}
                </address>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Update status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Order status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment status</Label>
                <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as typeof paymentStatus)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["PENDING", "PAID", "FAILED", "REFUNDED"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Carrier</Label>
                <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="UPS, DHL, FedEx..." />
              </div>
              <div>
                <Label>Tracking number</Label>
                <Input value={tracking} onChange={(e) => setTracking(e.target.value)} />
              </div>
              <Button onClick={onSave} className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader><CardTitle>Customer notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{order.notes}</p>
              </CardContent>
            </Card>
          )}
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
