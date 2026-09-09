import type { Metadata } from "next";
import Link from "next/link";

import { HelpNav } from "@/components/help/help-nav";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Returns & exchanges",
  description: "Vailmora return and exchange policy — how to start a return within 14 days.",
  alternates: { canonical: "/help/returns" },
};

export default function ReturnsPage() {
  return (
    <div className="container-x py-12">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Help centre
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Returns & exchanges</h1>
        <p className="mt-4 text-muted-foreground">
          We want you to love every piece. If something isn't right, we're here to help.
        </p>
      </header>

      <HelpNav current="/help/returns" />

      <div className="mx-auto mt-14 max-w-3xl space-y-10">
        <section className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl">Return policy</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>Returns accepted within <strong className="text-foreground">14 days</strong> of delivery.</li>
            <li>Items must be unworn, unwashed, and have all original tags attached.</li>
            <li>Sale items are final sale and cannot be returned.</li>
          </ul>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl">How to start a return</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              Go to{" "}
              <Link href="/account/orders" className="font-medium text-foreground underline underline-offset-2">
                My Account → Orders
              </Link>
              , select the item, and click &quot;Request Return&quot;.
            </li>
            <li>
              Or email{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="font-medium text-foreground underline underline-offset-2"
              >
                {SITE.email}
              </a>{" "}
              with your order number and the item you wish to return.
            </li>
            <li>Pack the item securely and ship it using the instructions we send you.</li>
          </ol>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl">Exchanges</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Exchanges for a different size of the same item are free of charge. Start an exchange the
            same way as a return and note the size you need in your request.
          </p>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl">Refunds</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Once we receive and inspect your return (1–3 business days), refunds are processed within
            5–7 business days to your original payment method.
          </p>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl">Damaged or defective items</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            If your item arrives damaged, photograph it and email us within 48 hours of delivery. We
            will arrange a free return and send a replacement or issue a full refund.
          </p>
        </section>
      </div>
    </div>
  );
}
