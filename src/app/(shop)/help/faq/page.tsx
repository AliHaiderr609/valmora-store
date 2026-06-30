import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE, SHIPPING, CURRENCY_SYMBOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Find answers to the most common questions about orders, shipping, returns, sizing, and your Vailmora account.",
};

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "orders",
    title: "Orders & Payment",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our collections, select your size and color, then click 'Add to Cart'. When you're ready, open the cart and proceed to checkout. You'll need to create an account or sign in to complete your purchase.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, MasterCard, American Express), as well as bank transfers. Cash on delivery is available for eligible areas.",
      },
      {
        q: "Can I modify or cancel my order?",
        a: "Orders can be modified or cancelled within 1 hour of placement. After that, the order enters processing and can no longer be changed. Please contact our support team as soon as possible if you need to make adjustments.",
      },
      {
        q: "Will I receive an order confirmation?",
        a: "Yes. A confirmation email is sent to your registered address immediately after your order is placed. You can also view all your orders under My Account → Orders.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. All transactions are processed over an encrypted HTTPS connection. We never store your full card details on our servers.",
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    items: [
      {
        q: "How much does shipping cost?",
        a: (
          <>
            Standard shipping is <strong>{CURRENCY_SYMBOL} {SHIPPING.flat}</strong>. Orders over{" "}
            <strong>
              {CURRENCY_SYMBOL} {SHIPPING.freeOver.toLocaleString()}
            </strong>{" "}
            qualify for free delivery. Express shipping is available for{" "}
            <strong>{CURRENCY_SYMBOL} {SHIPPING.expressFlat}</strong>.
          </>
        ),
      },
      {
        q: "How long does delivery take?",
        a: "Standard orders are delivered within 3–7 business days. Express orders arrive within 1–2 business days depending on your location. Remote areas may require additional time.",
      },
      {
        q: "Do you ship internationally?",
        a: "We currently ship within Pakistan. International shipping is on our roadmap — subscribe to our newsletter to be notified when it launches.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order has been dispatched you will receive a tracking number via email. You can also check your shipment status under My Account → Orders.",
      },
      {
        q: "What happens if my package is lost?",
        a: "If your tracking shows no movement for more than 5 business days, please contact us. We will investigate with the courier and either resend or fully refund your order.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 14 days of delivery, provided items are unworn, unwashed, and have all original tags attached. Sale items are final sale and cannot be returned.",
      },
      {
        q: "How do I start a return?",
        a: (
          <>
            Go to My Account → Orders, select the item you want to return, and click 'Request
            Return'. Alternatively, email us at{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="font-medium text-foreground underline underline-offset-2"
            >
              {SITE.email}
            </a>{" "}
            with your order number.
          </>
        ),
      },
      {
        q: "How long do refunds take?",
        a: "Once we receive and inspect the returned item (1–3 business days), refunds are processed within 5–7 business days back to your original payment method.",
      },
      {
        q: "Can I exchange an item for a different size?",
        a: "Yes. Exchanges for a different size of the same item are free of charge. Start an exchange the same way you would a return and note the size you need in the request.",
      },
      {
        q: "What if my item arrives damaged or defective?",
        a: "We're sorry to hear that. Please photograph the damage and email us within 48 hours of delivery. We will arrange a free return and send a replacement or issue a full refund.",
      },
    ],
  },
  {
    id: "sizing",
    title: "Sizing & Fit",
    items: [
      {
        q: "How do I find my size?",
        a: (
          <>
            Check our{" "}
            <Link href="/help/size-guide" className="font-medium text-foreground underline underline-offset-2">
              Size Guide
            </Link>{" "}
            for detailed measurements. If you're between sizes, we generally recommend sizing up
            for a relaxed fit or sizing down for a more tailored look.
          </>
        ),
      },
      {
        q: "Do your clothes run true to size?",
        a: "Most of our pieces are true to size. Each product page includes specific fit notes and customer reviews that mention sizing, so check those before ordering.",
      },
      {
        q: "Are kids' sizes in EU or US measurements?",
        a: "Our Boys collection uses age-based sizing (e.g. 4Y, 6Y, 8Y) with corresponding cm measurements listed on each product page.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & Loyalty",
    items: [
      {
        q: "How do I create an account?",
        a: (
          <>
            Click 'Sign In' in the top navigation and then 'Create an account'. You can also
            register during checkout. An account lets you track orders, save wishlists, and
            check out faster.
          </>
        ),
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "On the Sign In page, click 'Forgot password?' and enter your email address. You will receive a reset link within a few minutes. Check your spam folder if it doesn't appear.",
      },
      {
        q: "How do I update my email or address?",
        a: "Go to My Account → Profile Settings to update your personal details, shipping addresses, and communication preferences at any time.",
      },
      {
        q: "Is there a loyalty or rewards programme?",
        a: "We're building one! Subscribe to our newsletter to be among the first to join when Vailmora Rewards launches.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-x py-12">
      {/* Hero */}
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Help centre
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-muted-foreground">
          Can't find what you're looking for? Reach us at{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-foreground underline underline-offset-2"
          >
            {SITE.email}
          </a>{" "}
          and we'll get back to you within a few hours.
        </p>
      </header>

      {/* Category quick-links */}
      <nav className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
        {FAQ_CATEGORIES.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="rounded-full border bg-secondary/50 px-4 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
          >
            {cat.title}
          </a>
        ))}
      </nav>

      {/* FAQ sections */}
      <div className="mx-auto mt-14 max-w-3xl space-y-14">
        {FAQ_CATEGORIES.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-24">
            <h2 className="mb-4 font-serif text-2xl">{cat.title}</h2>
            <Accordion type="single" collapsible className="w-full">
              {cat.items.map((item, idx) => (
                <AccordionItem key={idx} value={`${cat.id}-${idx}`}>
                  <AccordionTrigger className="text-left text-sm font-medium">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      {/* Still need help CTA */}
      <div className="mx-auto mt-20 max-w-2xl rounded-2xl border bg-secondary/30 px-8 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
          <MessageCircle className="h-5 w-5 text-gold-600" />
        </div>
        <h3 className="mt-4 font-serif text-2xl">Still have questions?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Our support team is available Monday – Saturday, 9 am – 6 pm PKT.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={`mailto:${SITE.email}`}
            className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Email support
          </a>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center rounded-md border px-5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Contact page
          </Link>
        </div>
      </div>
    </div>
  );
}
