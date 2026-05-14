"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Truck, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { COLORS } from "@/lib/constants";
import { calcDiscountPct, cn, formatPrice } from "@/lib/utils";

export function ProductActions({
  product,
}: {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    sku: string;
    price: number;
    salePrice: number | null;
    stock: number;
    sizes: string[];
    colors: string[];
    fabric?: string | null;
    material?: string | null;
    images: { url: string }[];
    brand?: { name: string } | null;
    rating: number;
    reviewCount: number;
  };
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const inWish = useWishlist((s) => s.has(product.id));

  const [size, setSize] = React.useState<string | undefined>(product.sizes[0]);
  const [color, setColor] = React.useState<string | undefined>(product.colors[0]);
  const [qty, setQty] = React.useState(1);

  const price = product.salePrice ?? product.price;
  const onSale = !!product.salePrice && product.salePrice < product.price;
  const discount = onSale ? calcDiscountPct(product.price, product.salePrice) : 0;

  const onAddToCart = () => {
    if (product.stock <= 0) return toast.error("Out of stock");
    if (product.sizes.length > 0 && !size) return toast.error("Please select a size");
    add({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      price: product.price,
      salePrice: product.salePrice,
      quantity: qty,
      size,
      color,
      stock: product.stock,
    });
    toast.success("Added to your bag");
  };

  const onBuyNow = () => {
    onAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      <div>
        {product.brand && (
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {product.brand.name}
          </p>
        )}
        <h1 className="mt-2 font-serif text-3xl md:text-4xl">{product.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          <span>SKU: {product.sku}</span>
          {product.reviewCount > 0 && (
            <span>
              ★ {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-semibold">{formatPrice(price)}</p>
        {onSale && (
          <>
            <p className="text-lg text-muted-foreground line-through">
              {formatPrice(product.price)}
            </p>
            <Badge variant="destructive">-{discount}%</Badge>
          </>
        )}
      </div>

      {product.colors.length > 0 && (
        <div>
          <p className="text-sm font-medium">Color: <span className="font-normal text-muted-foreground">{color}</span></p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors.map((c) => {
              const swatch = COLORS.find((x) => x.name === c)?.value ?? "#888";
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-all",
                    color === c ? "border-foreground" : "border-transparent ring-1 ring-border"
                  )}
                  style={{ backgroundColor: swatch }}
                  aria-label={c}
                  title={c}
                />
              );
            })}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Size</p>
            <a href="/help/size-guide" className="text-xs underline">
              Size guide
            </a>
          </div>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "h-10 rounded-md border text-sm font-medium transition-colors hover:border-foreground",
                  size === s && "border-foreground bg-foreground text-background"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-md border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2.5 hover:bg-muted"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="p-2.5 hover:bg-muted"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          size="lg"
          onClick={onAddToCart}
          disabled={product.stock <= 0}
          variant="outline"
        >
          <ShoppingBag className="h-4 w-4" /> Add to bag
        </Button>
        <Button size="lg" onClick={onBuyNow} disabled={product.stock <= 0}>
          Buy now
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          toggleWish({
            productId: product.id,
            title: product.title,
            slug: product.slug,
            image: product.images[0]?.url ?? null,
            price: product.price,
            salePrice: product.salePrice,
          })
        }
      >
        <Heart className={cn("h-4 w-4", inWish && "fill-rose-500 text-rose-500")} />
        {inWish ? "Saved to wishlist" : "Save to wishlist"}
      </Button>

      <div className="space-y-3 rounded-lg border bg-secondary/30 p-4 text-sm">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Free shipping over $100</p>
            <p className="text-xs text-muted-foreground">
              Estimated delivery: 3–7 business days
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Undo2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">30-day easy returns</p>
            <p className="text-xs text-muted-foreground">
              Return any item within 30 days for a refund or exchange.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
