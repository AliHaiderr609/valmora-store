"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  title,
}: {
  images: { url: string; alt?: string | null }[];
  title: string;
}) {
  const [active, setActive] = React.useState(0);
  const [zoom, setZoom] = React.useState<{ x: number; y: number } | null>(null);

  if (!images.length) {
    return (
      <div className="aspect-[3/4] rounded-lg bg-muted" aria-label="No image" />
    );
  }

  const img = images[active];

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y });
  };

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
      <div className="flex md:flex-col gap-2 overflow-auto md:max-h-[600px] md:overflow-y-auto scrollbar-hide">
        {images.map((im, i) => (
          <button
            key={im.url}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2",
              i === active ? "border-foreground" : "border-transparent"
            )}
            aria-label={`Image ${i + 1}`}
          >
            <Image src={im.url} alt={im.alt ?? `${title} ${i + 1}`} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
      <div
        className="relative aspect-[3/4] flex-1 overflow-hidden rounded-lg bg-muted"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          src={img.url}
          alt={img.alt ?? title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover transition-transform duration-300"
          style={
            zoom
              ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: "scale(1.6)" }
              : undefined
          }
        />
      </div>
    </div>
  );
}
