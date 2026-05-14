"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/cart-store";
import { cn, formatPrice } from "@/lib/utils";

type Method = "STRIPE" | "COD";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clear } = useCart();

  const [breakdown, setBreakdown] = React.useState<{
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    appliedCoupon?: { code: string } | null;
  } | null>(null);
  const [coupon, setCoupon] = React.useState("");
  const [method, setMethod] = React.useState<Method>("STRIPE");
  const [submitting, setSubmitting] = React.useState(false);

  const [form, setForm] = React.useState({
    email: session?.user?.email ?? "",
    fullName: session?.user?.name ?? "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    notes: "",
  });

  const onField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  React.useEffect(() => {
    if (!items.length) return;
    const run = async () => {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon || "__none__",
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
        }),
      });
      const data = await res.json();
      if (data.ok) setBreakdown(data.data);
    };
    run();
  }, [items, coupon]);

  React.useEffect(() => {
    if (!items.length) router.replace("/cart");
  }, [items, router]);

  if (!items.length) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          shippingAddress: {
            fullName: form.fullName,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          paymentMethod: method,
          couponCode: coupon || undefined,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Checkout failed");

      if (data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        clear();
        router.push(`/order/success?order=${data.data.orderNumber}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to checkout");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x py-8">
      <h1 className="font-serif text-3xl md:text-4xl">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-serif text-xl">Contact</h2>
            <div className="mt-4 grid gap-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={onField("email")}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">Shipping address</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" required value={form.fullName} onChange={onField("fullName")} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" required value={form.phone} onChange={onField("phone")} />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" required value={form.country} onChange={onField("country")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" required value={form.line1} onChange={onField("line1")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
                <Input id="line2" value={form.line2} onChange={onField("line2")} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={form.city} onChange={onField("city")} />
              </div>
              <div>
                <Label htmlFor="state">State / Province</Label>
                <Input id="state" value={form.state} onChange={onField("state")} />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal code</Label>
                <Input id="postalCode" required value={form.postalCode} onChange={onField("postalCode")} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl">Payment method</h2>
            <div className="mt-4 grid gap-3">
              <PaymentOption
                active={method === "STRIPE"}
                onClick={() => setMethod("STRIPE")}
                icon={<CreditCard className="h-5 w-5" />}
                title="Credit or debit card"
                description="Pay securely via Stripe. Visa, Mastercard, Amex."
              />
              <PaymentOption
                active={method === "COD"}
                onClick={() => setMethod("COD")}
                icon={<Truck className="h-5 w-5" />}
                title="Cash on delivery"
                description="Pay in cash when your order arrives."
              />
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> Your information is encrypted and secure.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl">Order notes</h2>
            <Textarea
              className="mt-4"
              placeholder="Anything we should know? (optional)"
              value={form.notes}
              onChange={onField("notes")}
              rows={3}
            />
          </section>
        </div>

        <aside className="space-y-4 rounded-xl border bg-secondary/30 p-6 lg:sticky lg:top-24 lg:h-fit">
          <h2 className="font-serif text-xl">Order summary</h2>
          <ul className="space-y-3">
            {items.map((i) => {
              const price = i.salePrice ?? i.price;
              return (
                <li
                  key={`${i.productId}-${i.size ?? ""}-${i.color ?? ""}`}
                  className="flex gap-3"
                >
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {i.image && (
                      <Image src={i.image} alt={i.title} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/products/${i.slug}`}
                      className="line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {i.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Qty {i.quantity} · {[i.size, i.color].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-auto text-sm font-medium">
                      {formatPrice(price * i.quantity)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <Separator />

          <div className="flex items-center gap-2">
            <Input
              placeholder="Coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            />
          </div>

          {breakdown && (
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(breakdown.subtotal)} />
              {breakdown.discount > 0 && (
                <Row
                  label={`Discount${breakdown.appliedCoupon ? ` (${breakdown.appliedCoupon.code})` : ""}`}
                  value={`-${formatPrice(breakdown.discount)}`}
                  emphasis="success"
                />
              )}
              <Row
                label="Shipping"
                value={breakdown.shipping === 0 ? "Free" : formatPrice(breakdown.shipping)}
              />
              <Row label="Tax" value={formatPrice(breakdown.tax)} />
              <Separator className="my-2" />
              <Row label="Total" value={formatPrice(breakdown.total)} bold />
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting || !breakdown}>
            {submitting
              ? "Processing..."
              : method === "STRIPE"
              ? `Pay ${breakdown ? formatPrice(breakdown.total) : ""}`
              : "Place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
        active ? "border-foreground bg-background" : "border-input bg-secondary/30 hover:border-foreground/40"
      )}
    >
      <div className="rounded-md bg-background p-2">{icon}</div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div
        className={cn(
          "h-4 w-4 rounded-full border-2",
          active ? "border-foreground bg-foreground" : "border-input"
        )}
      />
    </button>
  );
}

function Row({
  label,
  value,
  bold,
  emphasis,
}: {
  label: string;
  value: string;
  bold?: boolean;
  emphasis?: "success" | "danger";
}) {
  return (
    <div className={cn("flex justify-between", bold && "font-semibold text-base")}>
      <span className={cn(!bold && "text-muted-foreground")}>{label}</span>
      <span
        className={cn(
          emphasis === "success" && "text-emerald-600",
          emphasis === "danger" && "text-rose-600"
        )}
      >
        {value}
      </span>
    </div>
  );
}
