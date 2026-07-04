import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, MessageCircle, Package, RefreshCw, Ruler } from "lucide-react";

import { HelpNav } from "@/components/help/help-nav";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Shipping, returns, sizing, FAQs, and support for your Vailmora orders.",
};

const TOPICS = [
  {
    href: "/help/faq",
    icon: HelpCircle,
    title: "FAQ",
    description: "Answers to common questions about orders, payments, and your account.",
  },
  {
    href: "/help/shipping",
    icon: Package,
    title: "Shipping",
    description: "Delivery times, costs, tracking, and what to do if a package goes missing.",
  },
  {
    href: "/help/returns",
    icon: RefreshCw,
    title: "Returns & exchanges",
    description: "How to return or exchange items within 14 days of delivery.",
  },
  {
    href: "/help/size-guide",
    icon: Ruler,
    title: "Size guide",
    description: "Measurements for Men, Women, and Boys collections to help you find the right fit.",
  },
  {
    href: "/contact",
    icon: MessageCircle,
    title: "Contact support",
    description: "Email or call our team — we typically respond within a few hours.",
  },
] as const;

export default function HelpPage() {
  return (
    <div className="container-x py-12">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Help centre
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">How can we help?</h1>
        <p className="mt-4 text-muted-foreground">
          Browse topics below or reach us at{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="font-medium text-foreground underline underline-offset-2"
          >
            {SITE.email}
          </a>
          .
        </p>
      </header>

      <HelpNav current="/help" />

      <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2">
        {TOPICS.map((topic) => (
          <Link
            key={topic.href}
            href={topic.href}
            className="group rounded-xl border bg-secondary/20 p-6 transition-colors hover:bg-secondary/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
              <topic.icon className="h-5 w-5 text-gold-600" />
            </div>
            <h2 className="mt-4 font-serif text-xl group-hover:underline">{topic.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{topic.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
