import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import { err, handleError, ok, parsePagination } from "@/lib/api";
import { generateOrderNumber } from "@/lib/utils";
import { priceCart } from "@/lib/pricing";
import { ensureStripe } from "@/lib/stripe";
import { SITE } from "@/lib/constants";
import { orderConfirmationEmail, sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return err("Unauthorized", 401);

    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url.searchParams);

    const where =
      session.user.role === "ADMIN" || session.user.role === "STAFF"
        ? {}
        : { userId: session.user.id };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) || 1 });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const data = checkoutSchema.parse(body);

    if (!session?.user && !data.email) {
      return err("Email is required for guest checkout", 400);
    }

    const breakdown = await priceCart(data.items, { couponCode: data.couponCode });
    if (!breakdown.lines.length) return err("No valid items in cart", 400);

    for (const line of breakdown.lines) {
      if (line.stock < line.quantity) {
        return err(`Insufficient stock for "${line.title}".`, 400);
      }
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const shipping = await tx.address.create({
        data: {
          ...data.shippingAddress,
          type: "SHIPPING",
          userId: session?.user.id ?? (await ensureGuestUser(tx, data.email!)),
        },
      });
      const billing = data.billingAddress
        ? await tx.address.create({
            data: {
              ...data.billingAddress,
              type: "BILLING",
              userId: shipping.userId,
            },
          })
        : shipping;

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user.id ?? shipping.userId,
          guestEmail: session?.user.email ?? data.email,
          status: "PENDING",
          paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PENDING",
          paymentMethod: data.paymentMethod,
          subtotal: breakdown.subtotal,
          discount: breakdown.discount,
          shipping: breakdown.shipping,
          tax: breakdown.tax,
          total: breakdown.total,
          currency: process.env.NEXT_PUBLIC_CURRENCY ?? "USD",
          couponCode: breakdown.appliedCoupon?.code,
          shippingAddressId: shipping.id,
          billingAddressId: billing.id,
          notes: data.notes,
          estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          items: {
            create: breakdown.lines.map((l) => ({
              productId: l.productId,
              title: l.title,
              image: l.image,
              sku: l.sku,
              price: l.unitPrice,
              quantity: l.quantity,
              size: l.size,
              color: l.color,
              subtotal: l.lineTotal,
            })),
          },
        },
        include: { items: true },
      });

      for (const l of breakdown.lines) {
        await tx.product.update({
          where: { id: l.productId },
          data: {
            stock: { decrement: l.quantity },
            soldCount: { increment: l.quantity },
          },
        });
      }

      if (breakdown.appliedCoupon) {
        await tx.coupon.update({
          where: { code: breakdown.appliedCoupon.code },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });

    if (data.paymentMethod === "STRIPE") {
      const stripe = ensureStripe();
      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${SITE.url}/order/success?order=${order.orderNumber}`,
        cancel_url: `${SITE.url}/checkout?canceled=1`,
        customer_email: session?.user.email ?? data.email,
        line_items: breakdown.lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: (process.env.NEXT_PUBLIC_CURRENCY ?? "usd").toLowerCase(),
            unit_amount: Math.round(l.unitPrice * 100),
            product_data: { name: l.title, images: l.image ? [l.image] : [] },
          },
        })),
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: Math.round(breakdown.shipping * 100),
                currency: (process.env.NEXT_PUBLIC_CURRENCY ?? "usd").toLowerCase(),
              },
              display_name:
                breakdown.shipping === 0 ? "Free shipping" : "Standard shipping",
            },
          },
        ],
        ...(breakdown.discount > 0
          ? {
              discounts: [
                {
                  coupon: await (async () => {
                    const c = await stripe.coupons.create({
                      amount_off: Math.round(breakdown.discount * 100),
                      currency: (process.env.NEXT_PUBLIC_CURRENCY ?? "usd").toLowerCase(),
                      duration: "once",
                    });
                    return c.id;
                  })(),
                },
              ],
            }
          : {}),
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: checkout.id },
      });

      return ok({ orderId: order.id, orderNumber: order.orderNumber, checkoutUrl: checkout.url });
    }

    await sendEmail({
      to: session?.user.email ?? data.email!,
      subject: `Order confirmed · ${order.orderNumber}`,
      html: orderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: session?.user.name ?? data.shippingAddress.fullName,
        total: `${process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? "$"}${breakdown.total.toFixed(2)}`,
        items: breakdown.lines.map((l) => ({
          title: l.title,
          quantity: l.quantity,
          price: `${process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? "$"}${l.lineTotal.toFixed(2)}`,
        })),
      }),
    });

    return ok({
      orderId: order.id,
      orderNumber: order.orderNumber,
      checkoutUrl: null,
      breakdown,
    });
  } catch (e) {
    return handleError(e);
  }
}

async function ensureGuestUser(
  tx: { user: { findUnique: typeof prisma.user.findUnique; create: typeof prisma.user.create } },
  email: string
) {
  const existing = await tx.user.findUnique({ where: { email } });
  if (existing) return existing.id;
  const created = await tx.user.create({
    data: { email, role: "CUSTOMER" },
  });
  return created.id;
}
