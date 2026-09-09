import type { Metadata } from "next";
import Link from "next/link";

import { HelpNav } from "@/components/help/help-nav";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Shipping & delivery",
  description: "Vailmora shipping rates, delivery times, and order tracking information.",
  alternates: { canonical: "/help/shipping" },
};

export default async function ShippingPage() {
  const {
    storeEmail,
    currencySymbol,
    shippingFlat,
    shippingFreeOver,
    shippingExpress,
  } = await getSettings();

  return (
    <div className="container-x py-12">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Help centre
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Shipping & delivery</h1>
        <p className="mt-4 text-muted-foreground">
          Everything you need to know about getting your order to your door.
        </p>
      </header>

      <HelpNav current="/help/shipping" />

      <div className="mx-auto mt-14 max-w-3xl space-y-10">
        <section className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl">Shipping rates</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Standard shipping:</strong>{" "}
              {currencySymbol} {shippingFlat} — delivered in 3–7 business days.
            </li>
            <li>
              <strong className="text-foreground">Free shipping:</strong> on orders over{" "}
              {currencySymbol} {shippingFreeOver.toLocaleString()}.
            </li>
            <li>
              <strong className="text-foreground">Express shipping:</strong>{" "}
              {currencySymbol} {shippingExpress} — delivered in 1–2 business days.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl">Where we ship</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            We currently ship within Pakistan. International delivery is on our roadmap — subscribe
            to our newsletter to be notified when it launches.
          </p>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl">Tracking your order</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Once your order has been dispatched, you will receive a tracking number by email. You can
            also view shipment status under{" "}
            <Link href="/account/orders" className="font-medium text-foreground underline underline-offset-2">
              My Account → Orders
            </Link>
            .
          </p>
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="font-serif text-2xl">Lost or delayed packages</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            If your tracking shows no movement for more than 5 business days, contact us at{" "}
            <a
              href={`mailto:${storeEmail}`}
              className="font-medium text-foreground underline underline-offset-2"
            >
              {storeEmail}
            </a>
            . We will investigate with the courier and either resend your order or issue a full refund.
          </p>
        </section>
      </div>
    </div>
  );
}
