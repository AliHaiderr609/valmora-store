import { headers } from "next/headers";
import type Stripe from "stripe";
import { ensureStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { err, ok } from "@/lib/api";
import { orderConfirmationEmail, sendEmail } from "@/lib/email";
import { toNumber } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = ensureStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return err("Webhook secret not configured", 500);

  const sig = (await headers()).get("stripe-signature");
  if (!sig) return err("Missing signature", 400);

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return err(`Webhook error: ${e instanceof Error ? e.message : "invalid"}`, 400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = (session.metadata?.orderId as string) ?? undefined;
      if (!orderId) break;

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "PROCESSING",
          stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
          payments: {
            create: {
              method: "STRIPE",
              status: "PAID",
              amount: (session.amount_total ?? 0) / 100,
              currency: (session.currency ?? "USD").toUpperCase(),
              transactionId:
                typeof session.payment_intent === "string" ? session.payment_intent : null,
              rawResponse: session as unknown as object,
            },
          },
        },
        include: { items: true, user: true },
      });

      if (order.user?.email || order.guestEmail) {
        await sendEmail({
          to: order.user?.email ?? order.guestEmail!,
          subject: `Payment received · ${order.orderNumber}`,
          html: orderConfirmationEmail({
            orderNumber: order.orderNumber,
            customerName: order.user?.name ?? "Customer",
            total: `${order.currency} ${toNumber(order.total).toFixed(2)}`,
            items: order.items.map((i) => ({
              title: i.title,
              quantity: i.quantity,
              price: `${order.currency} ${toNumber(i.subtotal).toFixed(2)}`,
            })),
          }),
        });
      }
      break;
    }
    case "checkout.session.async_payment_failed":
    case "payment_intent.payment_failed": {
      const session = event.data.object as { metadata?: { orderId?: string } };
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        });
      }
      break;
    }
  }

  return ok({ received: true });
}
