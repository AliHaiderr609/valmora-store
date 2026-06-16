import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { SITE } from "@/lib/constants";
import { NewsletterForm } from "@/components/home/newsletter-form";

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/men", label: "Men" },
      { href: "/women", label: "Women" },
      { href: "/boys", label: "Boys" },
      { href: "/products?onSale=true", label: "Sale" },
      { href: "/products?isNew=true", label: "New Arrivals" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Vailmora" },
      { href: "/blog", label: "Journal" },
      { href: "/contact", label: "Contact" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/help/shipping", label: "Shipping" },
      { href: "/help/returns", label: "Returns" },
      { href: "/help/size-guide", label: "Size Guide" },
      { href: "/help/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary/40">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <p className="font-serif text-3xl font-semibold tracking-wider">{SITE.name}</p>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">{SITE.description}</p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Join the list
              </p>
              <p className="mt-1 text-sm">Get 10% off your first order.</p>
              <NewsletterForm />
            </div>
          </div>

          {SECTIONS.map((sec) => (
            <div key={sec.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {sec.title}
              </p>
              <ul className="mt-4 space-y-3">
                {sec.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-foreground/80 hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href={SITE.social.instagram} aria-label="Instagram" className="hover:text-foreground">
              <Instagram className="h-5 w-5" />
            </a>
            <a href={SITE.social.facebook} aria-label="Facebook" className="hover:text-foreground">
              <Facebook className="h-5 w-5" />
            </a>
            <a href={SITE.social.twitter} aria-label="Twitter" className="hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </a>
            <a href={SITE.social.youtube} aria-label="YouTube" className="hover:text-foreground">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
