"use client";

import * as React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function BannersClient({ initial }: { initial: Banner[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    cta: "Shop now",
    position: "home_hero",
    order: 0,
  });
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

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

  const create = async () => {
    if (!form.image || !form.title) return toast.error("Title and image required");
    const res = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.ok) return toast.error(data.error ?? "Failed");
    toast.success("Banner created");
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New banner
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {initial.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <div className="relative aspect-[16/7]">
              <Image src={b.image} alt={b.title} fill sizes="500px" className="object-cover" />
            </div>
            <CardContent className="space-y-1 pt-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{b.title}</p>
                <Badge variant={b.isActive ? "success" : "outline"}>
                  {b.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
              <p className="text-xs text-muted-foreground">
                {b.position} · order {b.order}
              </p>
            </CardContent>
          </Card>
        ))}
        {initial.length === 0 && (
          <div className="md:col-span-2 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No banners yet. Create your first hero banner.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New banner</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div>
              <Label>Image</Label>
              {form.image ? (
                <div className="relative aspect-[16/7] overflow-hidden rounded-md border">
                  <Image src={form.image} alt="" fill sizes="500px" className="object-cover" />
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
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
                <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/women" />
              </div>
              <div>
                <Label>CTA label</Label>
                <Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
