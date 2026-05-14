"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Cat = {
  id: string;
  name: string;
  slug: string;
  gender: "MEN" | "WOMEN" | "BOYS" | "UNISEX" | null;
  isActive: boolean;
  order: number;
  productCount: number;
};

export function CategoriesClient({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Cat | null>(null);
  const [name, setName] = React.useState("");
  const [gender, setGender] = React.useState<string>("__none__");

  const onSave = async () => {
    if (!name.trim()) return toast.error("Name is required");
    const payload = { name, gender: gender === "__none__" ? null : gender };
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) return toast.error(data.error ?? "Failed");
    toast.success("Saved");
    setOpen(false);
    setEditing(null);
    setName("");
    setGender("__none__");
    router.refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) return toast.error(data.error ?? "Failed");
    toast.success("Deleted");
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setName("");
            setGender("__none__");
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initial.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                <TableCell>{c.gender ? <Badge variant="secondary">{c.gender}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>{c.productCount}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "success" : "outline"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(c);
                      setName(c.name);
                      setGender(c.gender ?? "__none__");
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(c.id)}>
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {initial.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No categories yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Gender (optional)</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  <SelectItem value="MEN">Men</SelectItem>
                  <SelectItem value="WOMEN">Women</SelectItem>
                  <SelectItem value="BOYS">Boys</SelectItem>
                  <SelectItem value="UNISEX">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onSave}>{editing ? "Save changes" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
