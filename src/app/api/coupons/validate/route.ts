import { handleError, ok } from "@/lib/api";
import { priceCart } from "@/lib/pricing";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        size: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const { code, items } = schema.parse(await req.json());
    const result = await priceCart(items, { couponCode: code });
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
