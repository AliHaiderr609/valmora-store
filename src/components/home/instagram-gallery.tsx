import Image from "next/image";
import { Instagram } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { SITE } from "@/lib/constants";

const IMAGES = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
];

export function InstagramGallery() {
  return (
    <section className="container-x py-16">
      <SectionHeading
        eyebrow="As seen on"
        title="@valmora"
        description="Tag us for a chance to be featured."
        align="center"
      />
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {IMAGES.map((src, i) => (
          <a
            key={i}
            href={SITE.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden rounded-md bg-muted"
          >
            <Image src={src} alt="" fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
              <Instagram className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
