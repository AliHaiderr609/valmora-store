import type { Coupon, Product } from "@prisma/client";
import { Resend } from "resend";

import { SITE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { calcDiscountPct, formatPrice, toNumber } from "@/lib/utils";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Valmora <noreply@vailmora.store>";
const resend = apiKey ? new Resend(apiKey) : null;

const BATCH_SIZE = 100;

function emailLayout(content: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-family:Georgia,serif;color:#92591f;margin:0 0 24px">${SITE.name}</h1>
    ${content}
    <p style="margin-top:32px;font-size:12px;color:#888">
      You received this because you subscribed to ${SITE.name} updates.
      <br />Shop at <a href="${SITE.url}" style="color:#92591f">${SITE.url.replace(/^https?:\/\//, "")}</a>
    </p>
  </div>`;
}

async function getActiveSubscriberEmails(): Promise<string[]> {
  const subs = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true },
  });
  return subs.map((s) => s.email);
}

async function broadcastToSubscribers(opts: {
  subject: string;
  html: string;
  text?: string;
}): Promise<{ sent: number; skipped: boolean }> {
  if (!resend) {
    console.warn("[newsletter] RESEND_API_KEY not configured — skipping broadcast");
    return { sent: 0, skipped: true };
  }

  const recipients = await getActiveSubscriberEmails();
  if (recipients.length === 0) {
    return { sent: 0, skipped: false };
  }

  let sent = 0;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const payload = chunk.map((to) => ({
      from,
      to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }));

    const { error } = await resend.batch.send(payload);
    if (error) {
      console.error("[newsletter] Batch send failed:", error);
      throw error;
    }
    sent += chunk.length;
  }

  console.log(`[newsletter] Sent "${opts.subject}" to ${sent} subscriber(s)`);
  return { sent, skipped: false };
}

export async function sendNewsletterWelcomeEmail(email: string) {
  if (!resend) {
    console.warn(`[newsletter] RESEND_API_KEY not configured — skipping welcome to ${email}`);
    return { skipped: true };
  }

  const html = emailLayout(`
    <h2 style="margin:0 0 12px">Welcome to ${SITE.name}!</h2>
    <p>Thanks for subscribing. You'll be the first to hear about new arrivals, exclusive sales, and special discount codes.</p>
    <p style="margin-top:24px">
      <a href="${SITE.url}/products" style="display:inline-block;background:#92591f;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600">
        Start shopping
      </a>
    </p>
  `);

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: `Welcome to ${SITE.name} — you're on the list!`,
    html,
    text: `Welcome to ${SITE.name}! You'll receive updates on new sales and exclusive offers. Shop now: ${SITE.url}/products`,
  });

  if (error) throw error;
  return data;
}

function formatCouponOffer(coupon: Pick<Coupon, "type" | "value" | "maxDiscount">): string {
  const value = toNumber(coupon.value);
  switch (coupon.type) {
    case "PERCENTAGE":
      return `${value}% off${coupon.maxDiscount ? ` (up to ${formatPrice(toNumber(coupon.maxDiscount))})` : ""}`;
    case "FIXED":
      return `${formatPrice(value)} off`;
    case "FREE_SHIPPING":
      return "Free shipping";
    default:
      return "Special offer";
  }
}

export async function notifySubscribersNewCoupon(
  coupon: Pick<Coupon, "code" | "description" | "type" | "value" | "maxDiscount" | "expiresAt" | "minOrder">
) {
  const offer = formatCouponOffer(coupon);
  const expires = coupon.expiresAt
    ? `<p style="color:#666">Valid until ${coupon.expiresAt.toLocaleDateString("en-PK", { dateStyle: "long" })}.</p>`
    : "";
  const minOrder = coupon.minOrder
    ? `<p style="color:#666">Minimum order: ${formatPrice(toNumber(coupon.minOrder))}.</p>`
    : "";

  const html = emailLayout(`
    <h2 style="margin:0 0 12px">New discount code for you</h2>
    <p>We just launched a new offer — use it at checkout:</p>
    <p style="margin:24px 0;padding:16px 24px;background:#faf6f0;border:2px dashed #92591f;border-radius:8px;text-align:center">
      <span style="display:block;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#666">Your code</span>
      <strong style="font-size:28px;font-family:monospace;color:#92591f">${coupon.code}</strong>
      <span style="display:block;margin-top:8px;font-size:18px;font-weight:600">${offer}</span>
    </p>
    ${coupon.description ? `<p>${coupon.description}</p>` : ""}
    ${minOrder}
    ${expires}
    <p style="margin-top:24px">
      <a href="${SITE.url}/products" style="display:inline-block;background:#92591f;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600">
        Shop the sale
      </a>
    </p>
  `);

  return broadcastToSubscribers({
    subject: `New offer: ${coupon.code} — ${offer}`,
    html,
    text: `New discount at ${SITE.name}: Use code ${coupon.code} for ${offer}. Shop: ${SITE.url}/products`,
  });
}

export async function notifySubscribersProductSale(
  product: Pick<Product, "title" | "slug" | "price" | "salePrice" | "isFlashSale">
) {
  const price = toNumber(product.price);
  const salePrice = product.salePrice ? toNumber(product.salePrice) : null;
  if (!salePrice) return { sent: 0, skipped: false };

  const pct = calcDiscountPct(price, salePrice);
  const productUrl = `${SITE.url}/products/${product.slug}`;
  const badge = product.isFlashSale ? "Flash sale" : "New sale";

  const html = emailLayout(`
    <h2 style="margin:0 0 12px">${badge}: ${product.title}</h2>
    <p>A item on your wishlist radar just went on sale — save <strong>${pct}%</strong> for a limited time.</p>
    <p style="margin:20px 0;font-size:18px">
      <span style="text-decoration:line-through;color:#999">${formatPrice(price)}</span>
      <strong style="margin-left:8px;color:#92591f;font-size:24px">${formatPrice(salePrice)}</strong>
    </p>
    <p style="margin-top:24px">
      <a href="${productUrl}" style="display:inline-block;background:#92591f;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600">
        View product
      </a>
    </p>
  `);

  return broadcastToSubscribers({
    subject: `${badge} — ${pct}% off ${product.title}`,
    html,
    text: `${badge} at ${SITE.name}: ${product.title} now ${formatPrice(salePrice)} (was ${formatPrice(price)}). ${productUrl}`,
  });
}

export function isNewOrImprovedSale(
  before: { salePrice: Product["salePrice"]; isFlashSale: boolean },
  after: { salePrice: Product["salePrice"]; isFlashSale: boolean }
): boolean {
  const beforeSale = before.salePrice ? toNumber(before.salePrice) : null;
  const afterSale = after.salePrice ? toNumber(after.salePrice) : null;

  if (after.isFlashSale && !before.isFlashSale && afterSale) return true;
  if (afterSale && !beforeSale) return true;
  if (afterSale && beforeSale && afterSale < beforeSale) return true;
  return false;
}

export function productHasSale(product: Pick<Product, "salePrice" | "isFlashSale">): boolean {
  return Boolean(product.salePrice && toNumber(product.salePrice) > 0);
}

/** Fire-and-forget helper — logs errors without blocking the API response. */
export function queueNewsletterEmail(task: () => Promise<unknown>, label: string) {
  task().catch((err) => console.error(`[newsletter] ${label} failed:`, err));
}
