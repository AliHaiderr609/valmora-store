"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  PercentCircle,
  Settings,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: PercentCircle },
  { href: "/admin/cms/banners", label: "CMS · Banners", icon: ImageIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-secondary/30 md:block">
      <div className="border-b px-6 py-5">
        <Link href="/admin" className="font-serif text-2xl tracking-wide">
          {SITE.name}
        </Link>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Admin</p>
      </div>
      <nav className="mt-4 space-y-1 px-3">
        {NAV.map((n) => {
          const active = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-foreground text-background" : "text-foreground/80 hover:bg-accent/10"
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-4 left-3 right-3">
        <Link
          href="/"
          className="block rounded-md border bg-background px-3 py-2 text-center text-xs hover:bg-accent/10"
        >
          ← View storefront
        </Link>
      </div>
    </aside>
  );
}
