import Image from "next/image";
import Link from "next/link";

const FALLBACK_CATEGORIES = [
  {
    name: "Women",
    href: "/women",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Men",
    href: "/men",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Boys",
    href: "/boys",
    image:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=1200&q=80",
  },
];

type Cat = { name: string; href: string; image: string };

export function CategoriesSection({ categories }: { categories?: Cat[] }) {
  const list = categories?.length ? categories : FALLBACK_CATEGORIES;
  return (
    <section className="container-x py-16">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {list.map((c) => (
          <Link
            key={c.name}
            href={c.href}
            className="group relative block aspect-[4/5] overflow-hidden rounded-lg"
          >
            <Image
              src={c.image}
              alt={c.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
                Shop the collection
              </p>
              <h3 className="mt-1 font-serif text-3xl">{c.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
