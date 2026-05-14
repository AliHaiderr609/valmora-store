import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div
        className="hidden md:block"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="font-serif text-3xl tracking-wider">
            {SITE.name}
          </Link>
          <div>
            <p className="font-serif text-3xl">
              "Premium fashion, designed to last."
            </p>
            <p className="mt-2 text-sm text-white/80">— The Valmora Atelier</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <header className="border-b px-6 py-4 md:hidden">
          <Link href="/" className="font-serif text-2xl">
            {SITE.name}
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
