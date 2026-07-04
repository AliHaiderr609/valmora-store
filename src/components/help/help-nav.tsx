import Link from "next/link";

const LINKS = [
  { href: "/help", label: "Overview", exact: true },
  { href: "/help/faq", label: "FAQ" },
  { href: "/help/shipping", label: "Shipping" },
  { href: "/help/returns", label: "Returns" },
  { href: "/help/size-guide", label: "Size Guide" },
  { href: "/contact", label: "Contact" },
] as const;

export function HelpNav({ current }: { current: string }) {
  return (
    <nav className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
      {LINKS.map((link) => {
        const active = link.exact ? current === link.href : current === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
