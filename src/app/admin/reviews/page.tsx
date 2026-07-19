import { prisma } from "@/lib/prisma";
import { ReviewsClient } from "@/components/admin/reviews-client";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { title: true, slug: true } },
    },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Moderate customer product reviews and ratings.
        </p>
      </header>
      <ReviewsClient
        initial={reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          isApproved: r.isApproved,
          createdAt: r.createdAt.toISOString(),
          userName: r.user.name,
          userEmail: r.user.email,
          productTitle: r.product.title,
          productSlug: r.product.slug,
        }))}
      />
    </div>
  );
}
