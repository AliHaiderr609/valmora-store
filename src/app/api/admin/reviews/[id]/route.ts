import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err, handleError, ok } from "@/lib/api";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return null;
  }
  return session;
}

async function recomputeProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });
}

const patchSchema = z.object({ isApproved: z.boolean() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;
    const { isApproved } = patchSchema.parse(await req.json());

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved },
    });
    await recomputeProductRating(review.productId);

    return ok(review);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;

    const review = await prisma.review.delete({ where: { id } });
    await recomputeProductRating(review.productId);

    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
