import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    if (!productId) return err("productId is required", 400);

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok(reviews);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return err("You must be signed in to leave a review.", 401);

    const data = reviewSchema.parse(await req.json());

    const review = await prisma.review.upsert({
      where: { productId_userId: { productId: data.productId, userId: session.user.id } },
      create: { ...data, userId: session.user.id },
      update: { rating: data.rating, title: data.title, comment: data.comment },
    });

    const agg = await prisma.review.aggregate({
      where: { productId: data.productId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: data.productId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });

    return ok(review);
  } catch (e) {
    return handleError(e);
  }
}
