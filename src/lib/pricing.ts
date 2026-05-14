import { prisma } from "@/lib/prisma";
import { SHIPPING, TAX_RATE } from "@/lib/constants";
import { toNumber } from "@/lib/utils";

export type CartLine = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
};

export type PricedLine = CartLine & {
  title: string;
  image: string | null;
  sku: string;
  unitPrice: number;
  lineTotal: number;
  stock: number;
};

export type PriceBreakdown = {
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  appliedCoupon?: { code: string; type: string; value: number } | null;
};

export async function priceCart(
  items: CartLine[],
  opts: { couponCode?: string; shippingMethod?: "standard" | "express" } = {}
): Promise<PriceBreakdown> {
  if (!items.length) {
    return {
      lines: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      appliedCoupon: null,
    };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, status: "ACTIVE" },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  const lines: PricedLine[] = [];
  for (const item of items) {
    const p = products.find((pr) => pr.id === item.productId);
    if (!p) continue;
    const unitPrice = p.salePrice ? toNumber(p.salePrice) : toNumber(p.price);
    lines.push({
      ...item,
      title: p.title,
      image: p.images[0]?.url ?? null,
      sku: p.sku,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      stock: p.stock,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  // Coupon
  let discount = 0;
  let appliedCoupon: PriceBreakdown["appliedCoupon"] = null;
  let freeShipping = false;
  if (opts.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: opts.couponCode.toUpperCase() },
    });
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (!coupon.startsAt || coupon.startsAt <= new Date()) &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
      (!coupon.minOrder || subtotal >= toNumber(coupon.minOrder))
    ) {
      const value = toNumber(coupon.value);
      if (coupon.type === "PERCENTAGE") {
        discount = (subtotal * value) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, toNumber(coupon.maxDiscount));
      } else if (coupon.type === "FIXED") {
        discount = Math.min(value, subtotal);
      } else if (coupon.type === "FREE_SHIPPING") {
        freeShipping = true;
      }
      appliedCoupon = { code: coupon.code, type: coupon.type, value };
    }
  }

  const baseShipping =
    opts.shippingMethod === "express" ? SHIPPING.expressFlat : SHIPPING.flat;
  const shipping =
    freeShipping || subtotal - discount >= SHIPPING.freeOver ? 0 : baseShipping;

  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;

  const total = Math.max(0, subtotal - discount + shipping + tax);

  return {
    lines,
    subtotal: round2(subtotal),
    discount: round2(discount),
    shipping: round2(shipping),
    tax: round2(tax),
    total: round2(total),
    appliedCoupon,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
