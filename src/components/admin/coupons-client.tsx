"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minOrder: number | null;
  isActive: boolean;
  usedCount: number;
  expiresAt: string | null;
};

export function CouponsClient({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    code: "",
    type: "PERCENTAGE" as Coupon["type"],
    value: 10,
    minOrder: 0,
    expiresAt: "",
  });

  const create = async () => {
    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: form.value,
      minOrder: form.minOrder || null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      isActive: true,
    };
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) return toast.error(data.error ?? "Failed");
    toast.success(`Coupon ${form.code} created`);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New coupon
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min order</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initial.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-medium">{c.code}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell>
                  {c.type === "PERCENTAGE"
                    ? `${c.value}%`
                    : c.type === "FREE_SHIPPING"
                    ? "Free shipping"
                    : formatPrice(c.value)}
                </TableCell>
                <TableCell>{c.minOrder ? formatPrice(c.minOrder) : "—"}</TableCell>
                <TableCell>{c.usedCount}</TableCell>
                <TableCell>{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "success" : "outline"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {initial.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No coupons yet. Create your first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME10"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as Coupon["type"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed amount</SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Min order</Label>
                <Input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Expires</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create}>Create coupon</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
