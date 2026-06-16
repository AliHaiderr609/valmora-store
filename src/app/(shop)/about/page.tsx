import type { Metadata } from "next";
import Image from "next/image";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Vailmora",
  description: "The story behind Vailmora — premium fashion designed to last.",
};

export default function AboutPage() {
  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">Our story</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Crafted to be worn, designed to last.</h1>
        <p className="mt-4 text-muted-foreground">
          Vailmora was founded with one belief: premium fashion shouldn't be a luxury. We work
          directly with the best ateliers in the world to bring you timeless pieces — for him,
          for her, and for the next generation.
        </p>
      </div>

      <div className="relative mt-12 aspect-[16/7] overflow-hidden rounded-xl bg-muted">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80"
          alt="Atelier"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {[
          { title: "Sustainable craft", body: "We source responsibly and pay our partners fairly. Every fabric tells a story." },
          { title: "Made to last", body: "Premium materials, double-stitched seams, and tested longevity." },
          { title: "Designed in-house", body: "Our atelier creates each collection from scratch — no shortcuts." },
        ].map((b) => (
          <div key={b.title}>
            <h3 className="font-serif text-2xl">{b.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        Want to get in touch? Reach us at{" "}
        <a href={`mailto:${SITE.email}`} className="font-medium text-foreground underline">
          {SITE.email}
        </a>
      </p>
    </div>
  );
}
