import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "USD";

export function formatPrice(
  amount: number | string | { toString(): string } | null | undefined,
  options: { currency?: string; notation?: Intl.NumberFormatOptions["notation"] } = {}
) {
  const num =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
      ? Number(amount)
      : amount
      ? Number(amount.toString())
      : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: options.currency ?? CURRENCY,
    notation: options.notation ?? "standard",
    maximumFractionDigits: 2,
  }).format(num);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VLM-${ts}-${rnd}`;
}

export function generateSku(prefix = "VLM"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function calcDiscountPct(price: number, salePrice: number | null): number {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function truncate(str: string, n: number): string {
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
}

export function absoluteUrl(path = "/"): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toNumber(d: { toString(): string } | number | string | null | undefined): number {
  if (d == null) return 0;
  if (typeof d === "number") return d;
  return Number(d.toString());
}
