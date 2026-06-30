"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { calcDiscountPct, cn, formatPrice } from "@/lib/utils";
import type { ProductListItem } from "@/types";

export function ProductCard({ product }: { product: ProductListItem }) {
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const inWish = useWishlist((s) => s.has(product.id));
  const [mainImgError, setMainImgError] = React.useState(false);

  const price = product.salePrice ?? product.price;
  const onSale = !!product.salePrice && product.salePrice < product.price;
  const discount = onSale ? calcDiscountPct(product.price, product.salePrice) : 0;
  const rawMain = product.images[0]?.url;
  const rawHover = product.images[1]?.url;
  // If the first image fails, promote the second as the main and drop the hover
  const mainImage = mainImgError ? rawHover : rawMain;
  const hoverImage = mainImgError ? undefined : rawHover;

  const onQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    add({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: mainImage ?? null,
      price: product.price,
      salePrice: product.salePrice,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0],
      stock: product.stock,
    });
    toast.success("Added to bag");
  };

  const onToggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWish({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: mainImage ?? null,
      price: product.price,
      salePrice: product.salePrice,
    });
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
        {mainImage && (
          <Image
            src={mainImage}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={() => setMainImgError(true)}
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-105",
              hoverImage && "group-hover:opacity-0"
            )}
          />
        )}
        {hoverImage && (
          <Image
            src={hoverImage}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && <Badge variant="destructive">-{discount}%</Badge>}
          {product.isFlashSale && <Badge variant="gold">Flash Sale</Badge>}
          {product.isTrending && !onSale && <Badge variant="secondary">Trending</Badge>}
          {product.stock <= 0 && <Badge variant="outline">Sold out</Badge>}
        </div>

        <button
          type="button"
          onClick={onToggleWish}
          aria-label="Wishlist"
          className={cn(
            "absolute right-3 top-3 rounded-full bg-background/90 p-2 shadow-sm transition-colors hover:bg-background",
            inWish && "text-rose-500"
          )}
        >
          <Heart className={cn("h-4 w-4", inWish && "fill-current")} />
        </button>

        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={onQuickAdd}
            disabled={product.stock <= 0}
          >
            <ShoppingBag className="h-4 w-4" /> Quick add
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {product.brand && (
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.brand.name}
          </p>
        )}
        <h3 className="line-clamp-1 text-sm font-medium">{product.title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-semibold">{formatPrice(price)}</p>
          {onSale && (
            <p className="text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </p>
          )}
        </div>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span>
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
