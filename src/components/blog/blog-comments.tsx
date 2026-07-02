"use client";

import * as React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

type Comment = {
  id: string;
  content: string;
  createdAt: Date | string;
  user: { name: string | null; image: string | null };
};

export function BlogComments({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const { data: session } = useSession();
  const [comments, setComments] = React.useState(initialComments);
  const [text, setText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 3) return toast.error("Comment is too short.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: text.trim() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to post comment.");
      toast.success("Comment posted!");
      setComments((prev) => [
        ...prev,
        {
          id: data.data.id,
          content: text.trim(),
          createdAt: new Date(),
          user: { name: session?.user?.name ?? "You", image: session?.user?.image ?? null },
        },
      ]);
      setText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      <h2 className="font-serif text-2xl">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      {session?.user ? (
        <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-5">
          <p className="text-sm font-medium">Leave a comment</p>
          <Textarea
            placeholder="Share your thoughts…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Posting…" : "Post comment"}
          </Button>
        </form>
      ) : (
        <p className="rounded-lg border bg-secondary/30 p-4 text-sm text-muted-foreground">
          <a href="/login" className="font-medium underline">
            Sign in
          </a>{" "}
          to join the conversation.
        </p>
      )}

      <ul className="space-y-6">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3 border-b pb-6 last:border-0">
            {c.user.image ? (
              <Image
                src={c.user.image}
                alt={c.user.name ?? ""}
                width={36}
                height={36}
                className="mt-0.5 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold uppercase">
                {(c.user.name ?? "A").charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold">{c.user.name ?? "Anonymous"}</span>
                <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{c.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
