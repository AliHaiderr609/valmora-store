"use client";

import * as React from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  cta: string | null;
  position: string;
  order: number;
  isActive: boolean;
};

const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  link: "",
  cta: "Shop now",
  position: "home_hero",
  order: 0,
  isActive: true,
};

export function BannersClient({ initial }: { initial: Banner[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Banner | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      image: b.image,
      link: b.link ?? "",
      cta: b.cta ?? "Shop now",
      position: b.position || "home_hero",
      order: b.order,
      isActive: b.isActive,
    });
    setOpen(true);
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, image: data.data.url }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!form.image || !form.title) return toast.error("Title and image required");
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || undefined,
        image: form.image,
        link: form.link || undefined,
        cta: form.cta || undefined,
        position: form.position,
        order: form.order,
        isActive: form.isActive,
      };
      const url = editing ? `/api/banners/${editing.id}` : "/api/banners";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) return toast.error(data.error ?? "Failed");
      toast.success(editing ? "Banner updated" : "Banner created");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this banner? This cannot be undone.")) return;
    const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) return toast.error(data.error ?? "Failed");
    toast.success("Banner deleted");
    router.refresh();
  };

  const onToggleActive = async (b: Banner) => {
    const res = await fetch(`/api/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    const data = await res.json();
    if (!data.ok) return toast.error(data.error ?? "Failed");
    toast.success(b.isActive ? "Banner deactivated" : "Banner activated");
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New banner
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {initial.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <div className="relative aspect-[16/7]">
              <Image src={b.image} alt={b.title} fill sizes="500px" className="object-cover" />
            </div>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">{b.title}</p>
                  {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
                  <p className="text-xs text-muted-foreground">
                    {b.position} · order {b.order}
                  </p>
                </div>
                <button type="button" onClick={() => onToggleActive(b)} title="Toggle active">
                  <Badge variant={b.isActive ? "success" : "outline"} className="cursor-pointer">
                    {b.isActive ? "Active" : "Inactive"}
                  </Badge>
                </button>
              </div>
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(b)} aria-label="Edit banner">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(b.id)} aria-label="Delete banner">
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {initial.length === 0 && (
          <div className="md:col-span-2 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No banners yet. Create your first hero banner.
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setEditing(null);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit banner" : "New banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>
            <div>
              <Label>Image</Label>
              {form.image ? (
                <div className="space-y-2">
                  <div className="relative aspect-[16/7] overflow-hidden rounded-md border">
                    <Image src={form.image} alt="" fill sizes="500px" className="object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Change image"}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload image"}
                </Button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Link</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="/women"
                />
              </div>
              <div>
                <Label>CTA label</Label>
                <Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.isActive ? "active" : "inactive"}
                  onValueChange={(v) => setForm({ ...form, isActive: v === "active" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={onSave} disabled={saving || uploading}>
                {saving ? "Saving..." : editing ? "Save changes" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
