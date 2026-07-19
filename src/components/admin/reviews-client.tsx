"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Star, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatDate } from "@/lib/utils";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  productTitle: string;
  productSlug: string;
};

type Filter = "all" | "pending" | "approved";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-amber-500 text-amber-500" : "text-muted"
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsClient({ initial }: { initial: Review[] }) {
  const router = useRouter();
  const [reviews, setReviews] = React.useState(initial);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<Review | null>(null);

  React.useEffect(() => setReviews(initial), [initial]);

  const counts = React.useMemo(
    () => ({
      all: reviews.length,
      pending: reviews.filter((r) => !r.isApproved).length,
      approved: reviews.filter((r) => r.isApproved).length,
    }),
    [reviews]
  );

  const visible = reviews.filter((r) =>
    filter === "all" ? true : filter === "pending" ? !r.isApproved : r.isApproved
  );

  const toggleApproval = async (review: Review) => {
    setPendingId(review.id);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !review.isApproved }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setReviews((rs) =>
        rs.map((r) => (r.id === review.id ? { ...r, isApproved: !r.isApproved } : r))
      );
      toast.success(review.isApproved ? "Review hidden" : "Review approved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setPendingId(null);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setPendingId(toDelete.id);
    try {
      const res = await fetch(`/api/admin/reviews/${toDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setReviews((rs) => rs.filter((r) => r.id !== toDelete.id));
      toast.success("Review deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setPendingId(null);
      setToDelete(null);
    }
  };

  return (
    <>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="max-w-[180px]">
                  <Link
                    href={`/products/${r.productSlug}`}
                    className="font-medium hover:underline"
                    target="_blank"
                  >
                    {r.productTitle}
                  </Link>
                </TableCell>
                <TableCell>
                  <Stars rating={r.rating} />
                </TableCell>
                <TableCell className="max-w-[280px]">
                  {r.title && <p className="font-medium">{r.title}</p>}
                  <p className="line-clamp-2 text-sm text-muted-foreground">{r.comment}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{r.userName ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{r.userEmail ?? ""}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(r.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={r.isApproved ? "success" : "outline"}>
                    {r.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingId === r.id}
                      onClick={() => toggleApproval(r)}
                    >
                      {r.isApproved ? (
                        <>
                          <Undo2 className="h-4 w-4" /> Hide
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" /> Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pendingId === r.id}
                      onClick={() => setToDelete(r)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No reviews here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete review?</DialogTitle>
            <DialogDescription>
              This permanently removes the review and recalculates the product rating. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={!!pendingId} onClick={remove}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
