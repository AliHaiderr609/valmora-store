import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Contact us",
  description: "Reach the Vailmora team — we're here to help.",
};

export default function ContactPage() {
  return (
    <div className="container-x py-12">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">Get in touch</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">We'd love to hear from you.</h1>
        <p className="mt-3 text-muted-foreground">
          Questions about an order, sizing, or wholesale? Our team typically responds within
          a few hours.
        </p>
      </header>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-3">
        <Item icon={<Mail className="h-5 w-5" />} title="Email" value={SITE.email} href={`mailto:${SITE.email}`} />
        <Item icon={<Phone className="h-5 w-5" />} title="Phone" value={SITE.phone} href={`tel:${SITE.phone}`} />
        <Item icon={<MapPin className="h-5 w-5" />} title="Visit us" value={SITE.address} />
      </div>
    </div>
  );
}

function Item({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border bg-secondary/30 p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background">
        {icon}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
