"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, remove, subtotal } = useCart();
  const total = subtotal();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Your bag ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Your bag is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start adding pieces you love.
            </p>
            <Button asChild className="mt-6" onClick={closeCart}>
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto px-6 py-4">
              <ul className="space-y-4">
                {items.map((item) => {
                  const price = item.salePrice ?? item.price;
                  return (
                    <li
                      key={`${item.productId}-${item.size ?? ""}-${item.color ?? ""}`}
                      className="flex gap-3"
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="line-clamp-2 text-sm font-medium hover:underline"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => remove(item.productId, item.size, item.color)}
                            aria-label="Remove"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-md border">
                            <button
                              type="button"
                              onClick={() =>
                                updateQty(item.productId, item.quantity - 1, item.size, item.color)
                              }
                              className="p-1.5 hover:bg-muted"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQty(item.productId, item.quantity + 1, item.size, item.color)
                              }
                              className="p-1.5 hover:bg-muted"
                              aria-label="Increase"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatPrice(price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t bg-secondary/30 px-6 py-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Shipping & taxes calculated at checkout.
              </p>
              <Separator className="my-3" />
              <div className="grid gap-2">
                <Button asChild size="lg" onClick={closeCart}>
                  <Link href="/checkout">Checkout · {formatPrice(total)}</Link>
                </Button>
                <Button asChild variant="outline" onClick={closeCart}>
                  <Link href="/cart">View bag</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
