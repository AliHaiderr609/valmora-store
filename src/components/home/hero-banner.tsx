"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
  cta?: string | null;
};

const FALLBACK: Banner[] = [
  {
    id: "default-1",
    title: "Effortless Luxury, Redefined",
    subtitle:
      "Discover the new season collection — premium fabrics, timeless silhouettes.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80",
    link: "/women",
    cta: "Shop Women",
  },
  {
    id: "default-2",
    title: "Crafted for the Modern Man",
    subtitle:
      "Tailored fits and elevated essentials for every occasion.",
    image:
      "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=2000&q=80",
    link: "/men",
    cta: "Shop Men",
  },
  {
    id: "default-3",
    title: "Little Trends, Big Moments",
    subtitle:
      "Comfortable, playful clothing for boys who are always on the move.",
    image:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=2000&q=80",
    link: "/boys",
    cta: "Shop Boys",
  },
];

export function HeroBanner({ banners }: { banners?: Banner[] }) {
  const slides = banners && banners.length > 0 ? banners : FALLBACK;
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-muted md:h-[80vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container-x relative z-10 flex h-full items-center">
        <motion.div
          key={`text-${slide.id}`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl text-white"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
            New Collection
          </p>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">{slide.title}</h1>
          {slide.subtitle && (
            <p className="mt-4 text-base text-white/90 md:text-lg">{slide.subtitle}</p>
          )}
          {slide.link && (
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg" variant="gold">
                <Link href={slide.link}>{slide.cta ?? "Shop now"}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/products">Explore all</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <button
        aria-label="Previous"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1 rounded-full transition-all",
              i === index ? "w-10 bg-white" : "w-4 bg-white/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}
