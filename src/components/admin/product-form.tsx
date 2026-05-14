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
import { COLORS, SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

type Image = { url: string; alt?: string };

type ProductFormProps = {
  initial?: Partial<{
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    sku: string;
    price: number;
    salePrice: number | null;
    costPrice: number | null;
    stock: number;
    categoryId: string;
    brandId: string | null;
    gender: "MEN" | "WOMEN" | "BOYS" | "UNISEX";
    sizes: string[];
    colors: string[];
    tags: string[];
    fabric: string;
    material: string;
    isFeatured: boolean;
    isTrending: boolean;
    isFlashSale: boolean;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    seoTitle: string;
    seoDesc: string;
    images: Image[];
  }>;
  categories: Category[];
  brands: Brand[];
};

export function ProductForm({ initial, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const [form, setForm] = React.useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    shortDescription: initial?.shortDescription ?? "",
    sku: initial?.sku ?? "",
    price: initial?.price ?? 0,
    salePrice: initial?.salePrice ?? null,
    costPrice: initial?.costPrice ?? null,
    stock: initial?.stock ?? 0,
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    brandId: initial?.brandId ?? null,
    gender: (initial?.gender ?? "UNISEX") as "MEN" | "WOMEN" | "BOYS" | "UNISEX",
    sizes: initial?.sizes ?? [],
    colors: initial?.colors ?? [],
    tags: initial?.tags ?? [],
    fabric: initial?.fabric ?? "",
    material: initial?.material ?? "",
    isFeatured: initial?.isFeatured ?? false,
    isTrending: initial?.isTrending ?? false,
    isFlashSale: initial?.isFlashSale ?? false,
    status: (initial?.status ?? "ACTIVE") as "DRAFT" | "ACTIVE" | "ARCHIVED",
    seoTitle: initial?.seoTitle ?? "",
    seoDesc: initial?.seoDesc ?? "",
    images: initial?.images ?? ([] as Image[]),
  });

  const [tagInput, setTagInput] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleArr = (key: "sizes" | "colors", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: Image[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.ok) uploaded.push({ url: data.data.url });
        else toast.error(data.error ?? "Upload failed");
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = initial?.id ? `/api/products/${initial.id}` : "/api/products";
      const method = initial?.id ? "PATCH" : "POST";
      const payload = {
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        stock: Number(form.stock),
        images: form.images.map((img, idx) => ({ ...img, isMain: idx === 0 })),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      toast.success(initial?.id ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!initial?.id || !confirm("Delete this product? This cannot be undone.")) return;
    const res = await fetch(`/api/products/${initial.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) return toast.error(data.error ?? "Failed");
    toast.success("Product deleted");
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader><CardTitle>Basic info</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Title" required>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
            </Field>
            <Field label="Slug (auto-generated if empty)">
              <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} />
            </Field>
            <Field label="Short description">
              <Input value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} />
            </Field>
            <Field label="Description" required>
              <Textarea
                rows={6}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Media</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.images.map((img, idx) => (
                <div key={img.url} className="group relative aspect-square overflow-hidden rounded-md border">
                  <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
                    }
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background">
                      Main
                    </span>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square items-center justify-center rounded-md border border-dashed hover:bg-accent/10"
              >
                {uploading ? "Uploading..." : (
                  <div className="text-center">
                    <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-xs text-muted-foreground">Upload images</p>
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onUpload(e.target.files)}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              First image is shown as the main product image. Requires Cloudinary env vars.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Sizes</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleArr("sizes", s)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-medium",
                      form.sizes.includes(s) && "border-foreground bg-foreground text-background"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Colors</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleArr("colors", c.name)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                      form.colors.includes(c.name) && "border-foreground bg-foreground text-background"
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: c.value }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Fabric">
                <Input value={form.fabric} onChange={(e) => update("fabric", e.target.value)} />
              </Field>
              <Field label="Material">
                <Input value={form.material} onChange={(e) => update("material", e.target.value)} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <Field label="SEO title">
              <Input value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
            </Field>
            <Field label="SEO description">
              <Textarea
                rows={3}
                value={form.seoDesc}
                onChange={(e) => update("seoDesc", e.target.value)}
              />
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
                      update("tags", [...form.tags, tagInput.trim().toLowerCase()]);
                      setTagInput("");
                    }
                  }}
                  className="flex-1 bg-transparent text-sm outline-none"
                  placeholder="Add tag and press Enter"
                />
              </div>
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => update("status", v as typeof form.status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <ToggleField
              label="Featured"
              checked={form.isFeatured}
              onChange={(v) => update("isFeatured", v)}
            />
            <ToggleField
              label="Trending"
              checked={form.isTrending}
              onChange={(v) => update("isTrending", v)}
            />
            <ToggleField
              label="Flash Sale"
              checked={form.isFlashSale}
              onChange={(v) => update("isFlashSale", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Price" required>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Sale price">
              <Input
                type="number"
                step="0.01"
                value={form.salePrice ?? ""}
                onChange={(e) => update("salePrice", e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
            <Field label="Cost price">
              <Input
                type="number"
                step="0.01"
                value={form.costPrice ?? ""}
                onChange={(e) => update("costPrice", e.target.value ? Number(e.target.value) : null)}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
          <CardContent>
            <Field label="Stock" required>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => update("stock", Number(e.target.value))}
                required
              />
            </Field>
            <Field label="SKU">
              <Input value={form.sku} onChange={(e) => update("sku", e.target.value)} placeholder="Auto-generated" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Gender">
              <Select value={form.gender} onValueChange={(v) => update("gender", v as typeof form.gender)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEN">Men</SelectItem>
                  <SelectItem value="WOMEN">Women</SelectItem>
                  <SelectItem value="BOYS">Boys</SelectItem>
                  <SelectItem value="UNISEX">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Category" required>
              <Select value={form.categoryId} onValueChange={(v) => update("categoryId", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Brand">
              <Select
                value={form.brandId ?? "__none__"}
                onValueChange={(v) => update("brandId", v === "__none__" ? null : v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : initial?.id ? "Update product" : "Create product"}
          </Button>
          {initial?.id && (
            <Button type="button" variant="destructive" className="w-full" onClick={onDelete}>
              <Trash2 className="h-4 w-4" /> Delete product
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-md border p-2.5">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}
