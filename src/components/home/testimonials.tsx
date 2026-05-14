import { Star } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";

const REVIEWS = [
  {
    name: "Sophia M.",
    rating: 5,
    title: "Impeccable quality",
    body:
      "Every Valmora piece I own feels timeless and beautifully made. The fabrics are stunning.",
  },
  {
    name: "James K.",
    rating: 5,
    title: "Best fit I've found",
    body:
      "Their tailored shirts fit me better than designer brands I've spent triple on.",
  },
  {
    name: "Aisha R.",
    rating: 5,
    title: "Fast & flawless",
    body:
      "Arrived in three days, packaging is premium and the kids' line is so well made.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-secondary/30 py-16">
      <div className="container-x">
        <SectionHeading
          eyebrow="What people say"
          title="Loved by thousands"
          align="center"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name} className="rounded-xl border bg-background p-6 shadow-sm">
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 font-serif text-lg">{r.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-foreground/70">
                — {r.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
