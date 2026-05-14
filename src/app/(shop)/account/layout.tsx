import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, MapPin, Package, Settings, User } from "lucide-react";

import { auth } from "@/lib/auth";

const NAV = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  return (
    <div className="container-x py-8">
      <header className="mb-8 border-b pb-6">
        <h1 className="font-serif text-3xl md:text-4xl">My account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {session.user.name ?? session.user.email}.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside>
          <nav className="space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent/10"
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
