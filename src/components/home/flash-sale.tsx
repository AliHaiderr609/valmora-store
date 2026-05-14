"use client";

import * as React from "react";
import { Flame } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/home/section-heading";
import type { ProductListItem } from "@/types";

function useCountdown(targetMs?: number) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    if (!targetMs) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [targetMs]);

  if (!targetMs) return null;
  const diff = Math.max(0, targetMs - now);
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

export function FlashSale({
  products,
  endsAt,
}: {
  products: ProductListItem[];
  endsAt?: string | Date | null;
}) {
  const t = useCountdown(endsAt ? new Date(endsAt).getTime() : undefined);

  if (!products.length) return null;

  return (
    <section className="container-x py-16">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Limited time"
          title="Flash Sale"
          description="Premium pieces at exceptional prices. Don't miss out."
          href="/products?isFlashSale=true"
        />
        {t && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Flame className="h-4 w-4 text-rose-500" />
            <span>Ends in</span>
            {[
              { v: t.d, l: "d" },
              { v: t.h, l: "h" },
              { v: t.m, l: "m" },
              { v: t.s, l: "s" },
            ].map((p) => (
              <div
                key={p.l}
                className="rounded-md bg-foreground px-2 py-1 font-mono text-background"
              >
                {String(p.v).padStart(2, "0")}
                {p.l}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
