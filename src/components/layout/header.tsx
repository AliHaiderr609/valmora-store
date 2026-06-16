"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { GENDERS, SHIPPING, SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const cartCount = useCart((s) => s.count());
  const openCart = useCart((s) => s.openCart);
  const wishCount = useWishlist((s) => s.items.length);
  const [query, setQuery] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <div className="border-b bg-primary text-primary-foreground">
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <p className="hidden sm:block">
            Free shipping on orders over {formatPrice(SHIPPING.freeOver)} · Easy 30-day returns
          </p>
          <p className="sm:hidden">Free shipping over {formatPrice(SHIPPING.freeOver)}</p>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="hover:underline">
              Journal
            </Link>
            <Link href="/help" className="hover:underline">
              Help
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-x flex h-16 items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl tracking-wide">{SITE.name}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {GENDERS.map((g) => (
                  <Link
                    key={g.value}
                    href={g.href}
                    className="rounded-md px-3 py-2 text-base font-medium hover:bg-accent/10"
                  >
                    {g.label}
                  </Link>
                ))}
                <Link href="/products?onSale=true" className="rounded-md px-3 py-2 text-base font-medium hover:bg-accent/10">
                  Sale
                </Link>
                <Link href="/blog" className="rounded-md px-3 py-2 text-base font-medium hover:bg-accent/10">
                  Journal
                </Link>
                <Link href="/about" className="rounded-md px-3 py-2 text-base font-medium hover:bg-accent/10">
                  About
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-semibold tracking-wider md:text-3xl">
              {SITE.name}
            </span>
          </Link>

          <nav className="hidden flex-1 items-center gap-8 pl-8 md:flex">
            {GENDERS.map((g) => (
              <Link
                key={g.value}
                href={g.href}
                className="text-sm font-medium uppercase tracking-wider text-foreground/80 transition-colors hover:text-foreground"
              >
                {g.label}
              </Link>
            ))}
            <Link
              href="/products?onSale=true"
              className="text-sm font-medium uppercase tracking-wider text-rose-600"
            >
              Sale
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium uppercase tracking-wider text-foreground/80 hover:text-foreground"
            >
              Journal
            </Link>
          </nav>

          <form onSubmit={onSearch} className="ml-auto hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="h-9 w-64 pl-9"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <ThemeToggle />
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {mounted && wishCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                    {wishCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Cart"
              onClick={openCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {session?.user ? (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{session.user.name}</span>
                        <span className="text-xs text-muted-foreground">{session.user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account"><User className="mr-2 h-4 w-4" /> My account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders"><Package className="mr-2 h-4 w-4" /> Orders</Link>
                    </DropdownMenuItem>
                    {(session.user.role === "ADMIN" || session.user.role === "STAFF") && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Sign in</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Create account</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <form onSubmit={onSearch} className="container-x pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
        </form>
      </header>

      <CartDrawer />
    </>
  );
}
