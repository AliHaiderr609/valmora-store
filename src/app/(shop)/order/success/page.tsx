"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-store";

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const clear = useCart((s) => s.clear);

  React.useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="container-x py-20 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
      <h1 className="mt-4 font-serif text-4xl">Thank you for your order!</h1>
      {orderNumber && (
        <p className="mt-3 text-muted-foreground">
          Your order <strong>{orderNumber}</strong> is confirmed. A receipt has been
          sent to your email.
        </p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/account/orders">View my orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <React.Suspense fallback={<div className="container-x py-20 text-center text-muted-foreground">Loading…</div>}>
      <OrderSuccessContent />
    </React.Suspense>
  );
}
