import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ?     new Stripe(key, { typescript: true })
  : (null as unknown as Stripe);

export function ensureStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in your .env to enable card payments."
    );
  }
  return stripe;
}
