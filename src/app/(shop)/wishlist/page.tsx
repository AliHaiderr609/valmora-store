"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/store/wishlist-store";
import { useCart } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const add = useCart((s) => s.add);

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-3xl">Your wishlist is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Save pieces you love by tapping the heart on any product.
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <h1 className="font-serif text-3xl md:text-4xl">My wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">{items.length} items saved</p>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <li key={it.productId} className="group">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
              {it.image && (
                <Image
                  src={it.image}
                  alt={it.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <button
                type="button"
                onClick={() => remove(it.productId)}
                className="absolute right-3 top-3 rounded-full bg-background/90 p-2 hover:bg-background"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Link
              href={`/products/${it.slug}`}
              className="mt-3 block text-sm font-medium hover:underline"
            >
              {it.title}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatPrice(it.salePrice ?? it.price)}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              onClick={() => {
                add({
                  productId: it.productId,
                  title: it.title,
                  slug: it.slug,
                  image: it.image,
                  price: it.price,
                  salePrice: it.salePrice,
                  quantity: 1,
                  stock: 100,
                });
                toast.success("Added to bag");
              }}
            >
              <ShoppingBag className="h-4 w-4" /> Add to bag
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
