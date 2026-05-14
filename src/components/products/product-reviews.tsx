"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: Date | string;
  user: { name: string | null; image: string | null };
};

export function ProductReviews({
  productId,
  initialReviews,
  averageRating,
  reviewCount,
}: {
  productId: string;
  initialReviews: Review[];
  averageRating: number;
  reviewCount: number;
}) {
  const { data: session } = useSession();
  const [reviews, setReviews] = React.useState(initialReviews);
  const [rating, setRating] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please give a rating.");
    if (comment.length < 5) return toast.error("Please write a longer review.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      toast.success("Thanks for your review!");
      setReviews((r) => [
        {
          id: data.data.id,
          rating,
          title,
          comment,
          createdAt: new Date(),
          user: { name: session?.user?.name ?? "You", image: session?.user?.image ?? null },
        },
        ...r,
      ]);
      setRating(0);
      setTitle("");
      setComment("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end gap-6 border-b pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Customer reviews
          </p>
          <h2 className="mt-1 font-serif text-3xl">{averageRating.toFixed(1)} / 5</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(averageRating) ? "fill-amber-500 text-amber-500" : "text-muted"
                  )}
                />
              ))}
            </div>
            <span>{reviewCount} reviews</span>
          </div>
        </div>
      </div>

      {session?.user ? (
        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-6">
          <p className="font-medium">Leave a review</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} stars`}
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    n <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Post review"}
          </Button>
        </form>
      ) : (
        <p className="rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
          <a href="/login" className="font-medium underline">
            Sign in
          </a>{" "}
          to leave a review.
        </p>
      )}

      <ul className="space-y-6">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
        )}
        {reviews.map((r) => (
          <li key={r.id} className="border-b pb-6 last:border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{r.user.name ?? "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < r.rating ? "fill-amber-500 text-amber-500" : "text-muted"
                    )}
                  />
                ))}
              </div>
            </div>
            {r.title && <p className="mt-2 font-medium">{r.title}</p>}
            <p className="mt-1 text-sm text-foreground/80">{r.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
