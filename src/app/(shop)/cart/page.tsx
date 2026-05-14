"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Tag, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQty, remove, subtotal } = useCart();
  const [coupon, setCoupon] = React.useState("");
  const [applied, setApplied] = React.useState<{ code: string; discount: number } | null>(null);
  const [validating, setValidating] = React.useState(false);
  const total = subtotal();

  const onApplyCoupon = async () => {
    if (!coupon) return;
    setValidating(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Invalid coupon");
      if (!data.data.appliedCoupon) {
        toast.error("Coupon could not be applied.");
        setApplied(null);
      } else {
        setApplied({ code: data.data.appliedCoupon.code, discount: data.data.discount });
        toast.success(`Coupon "${data.data.appliedCoupon.code}" applied`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setValidating(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-3xl">Your bag is empty</h1>
        <p className="mt-2 text-muted-foreground">Time to find something you'll love.</p>
        <Button asChild className="mt-6" size="lg">
          <Link href="/products">Start shopping</Link>
        </Button>
      </div>
    );
  }

  const discount = applied?.discount ?? 0;
  const estTotal = Math.max(0, total - discount);

  return (
    <div className="container-x py-8">
      <h1 className="font-serif text-3xl md:text-4xl">Your bag</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <ul className="divide-y">
          {items.map((item) => {
            const price = item.salePrice ?? item.price;
            return (
              <li
                key={`${item.productId}-${item.size ?? ""}-${item.color ?? ""}`}
                className="flex gap-4 py-6"
              >
                <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                      {item.title}
                    </Link>
                    <button
                      onClick={() => remove(item.productId, item.size, item.color)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[item.size, item.color].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-md border">
                      <button
                        type="button"
                        className="p-2 hover:bg-muted"
                        aria-label="Decrease"
                        onClick={() => updateQty(item.productId, item.quantity - 1, item.size, item.color)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="p-2 hover:bg-muted"
                        aria-label="Increase"
                        onClick={() => updateQty(item.productId, item.quantity + 1, item.size, item.color)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-semibold">{formatPrice(price * item.quantity)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="rounded-xl border bg-secondary/30 p-6 lg:sticky lg:top-24">
          <h2 className="font-serif text-xl">Summary</h2>

          <div className="mt-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            />
            <Button onClick={onApplyCoupon} disabled={validating} variant="outline">
              {validating ? "..." : "Apply"}
            </Button>
          </div>

          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            {applied && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({applied.code})</span>
                <span>-{formatPrice(applied.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm">Estimated total</span>
            <span className="text-xl font-semibold">{formatPrice(estTotal)}</span>
          </div>

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full" size="sm">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
