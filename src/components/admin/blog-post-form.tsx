"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };

type BlogPostFormProps = {
  initial?: Partial<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    tags: string[];
    categoryId: string | null;
    isPublished: boolean;
    publishedAt: string | null;
    seoTitle: string;
    seoDesc: string;
  }>;
  categories: Category[];
};

export function BlogPostForm({ initial, categories }: BlogPostFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = React.useState("");

  const [form, setForm] = React.useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? null as string | null,
    tags: initial?.tags ?? [] as string[],
    categoryId: initial?.categoryId ?? null as string | null,
    isPublished: initial?.isPublished ?? false,
    publishedAt: initial?.publishedAt
      ? new Date(initial.publishedAt).toISOString().slice(0, 16)
      : "",
    seoTitle: initial?.seoTitle ?? "",
    seoDesc: initial?.seoDesc ?? "",
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onUploadCover = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) update("coverImage", data.data.url);
      else toast.error(data.error ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required.");
    if (!form.content.trim()) return toast.error("Content is required.");
    setSubmitting(true);
    try {
      const url = initial?.id ? `/api/admin/blog/${initial.id}` : "/api/admin/blog";
      const method = initial?.id ? "PATCH" : "POST";
      const payload = {
        ...form,
        categoryId: form.categoryId || null,
        publishedAt: form.publishedAt || null,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      toast.success(initial?.id ? "Post updated" : "Post created");
      router.push("/admin/blog");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!initial?.id || !confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/blog/${initial.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) return toast.error(data.error ?? "Failed");
    toast.success("Post deleted");
    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      {/* ── Left column ── */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader><CardTitle>Post content</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Title" required>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="My style guide for autumn"
                required
              />
            </Field>
            <Field label="Slug (auto-generated if empty)">
              <Input
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="my-style-guide-for-autumn"
              />
            </Field>
            <Field label="Excerpt">
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                placeholder="A short summary shown on the listing page and in SEO descriptions."
              />
            </Field>
            <Field label="Content (HTML supported)" required>
              <Textarea
                rows={18}
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                placeholder="<p>Your article content here…</p>"
                required
                className="font-mono text-xs"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cover image</CardTitle></CardHeader>
          <CardContent>
            {form.coverImage ? (
              <div className="group relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={form.coverImage}
                  alt="Cover"
                  fill
                  sizes="600px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => update("coverImage", null)}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 hover:bg-accent/10"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Uploading…" : "Click to upload cover image"}
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUploadCover(e.target.files)}
            />
            {!form.coverImage && (
              <p className="mt-2 text-xs text-muted-foreground">
                Or paste a URL below.
              </p>
            )}
            {!form.coverImage && (
              <Input
                className="mt-2"
                placeholder="https://…"
                value=""
                onChange={(e) => e.target.value && update("coverImage", e.target.value)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <Field label="SEO title">
              <Input
                value={form.seoTitle}
                onChange={(e) => update("seoTitle", e.target.value)}
                placeholder="Defaults to post title"
              />
            </Field>
            <Field label="SEO description">
              <Textarea
                rows={3}
                value={form.seoDesc}
                onChange={(e) => update("seoDesc", e.target.value)}
                placeholder="Defaults to excerpt"
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      {/* ── Right column ── */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between rounded-md border p-2.5">
              <span className="text-sm">Published</span>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => update("isPublished", e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <Field label="Publish date / time">
              <Input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => update("publishedAt", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Organisation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Category">
              <Select
                value={form.categoryId ?? "__none__"}
                onValueChange={(v) => update("categoryId", v === "__none__" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="— None —" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tags (press Enter)">
              <div className="flex flex-wrap items-center gap-2 rounded-md border p-2">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => update("tags", form.tags.filter((x) => x !== t))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      e.preventDefault();
                      const tag = tagInput.trim().toLowerCase();
                      if (!form.tags.includes(tag)) {
                        update("tags", [...form.tags, tag]);
                      }
                      setTagInput("");
                    }
                  }}
                  className={cn("flex-1 bg-transparent text-sm outline-none min-w-[80px]")}
                  placeholder="Add tag…"
                />
              </div>
            </Field>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : initial?.id ? "Update post" : "Create post"}
          </Button>
          {initial?.id && (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete post
            </Button>
          )}
          <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
