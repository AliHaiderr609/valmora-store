"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { AppSettings } from "@/lib/settings";

interface Props {
  initialSettings: AppSettings;
}

export function SettingsClient({ initialSettings }: Props) {
  const [form, setForm] = useState<AppSettings>(initialSettings);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateNumber(key: keyof AppSettings, raw: string) {
    const num = parseFloat(raw);
    update(key, (isNaN(num) ? 0 : num) as AppSettings[typeof key]);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed to save");
        toast.success("Settings saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save settings");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage store configuration — changes apply site-wide within minutes.
          </p>
        </div>
        <Button onClick={handleSave} disabled={pending} className="min-w-24">
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <Tabs defaultValue="store">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="shipping">Shipping & Tax</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
        </TabsList>

        {/* ── Store Info ── */}
        <TabsContent value="store" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Store information</CardTitle>
              <CardDescription>
                Displayed in the footer, contact page, and email notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Store name</Label>
                <Input
                  value={form.storeName}
                  onChange={(e) => update("storeName", e.target.value)}
                  placeholder="Vailmora"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Support email</Label>
                <Input
                  type="email"
                  value={form.storeEmail}
                  onChange={(e) => update("storeEmail", e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone number</Label>
                <Input
                  type="tel"
                  value={form.storePhone}
                  onChange={(e) => update("storePhone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input
                  value={form.storeAddress}
                  onChange={(e) => update("storeAddress", e.target.value)}
                  placeholder="123 Main St, City"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Store description</Label>
                <Textarea
                  rows={3}
                  value={form.storeDescription}
                  onChange={(e) => update("storeDescription", e.target.value)}
                  placeholder="A short description of your store shown in SEO and the footer."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Social Links ── */}
        <TabsContent value="social" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Social media links</CardTitle>
              <CardDescription>
                Used in the footer social icons. Leave blank to hide a platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Instagram URL</Label>
                <Input
                  value={form.socialInstagram}
                  onChange={(e) => update("socialInstagram", e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Facebook URL</Label>
                <Input
                  value={form.socialFacebook}
                  onChange={(e) => update("socialFacebook", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Twitter / X URL</Label>
                <Input
                  value={form.socialTwitter}
                  onChange={(e) => update("socialTwitter", e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div className="space-y-1.5">
                <Label>YouTube URL</Label>
                <Input
                  value={form.socialYoutube}
                  onChange={(e) => update("socialYoutube", e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Shipping & Tax ── */}
        <TabsContent value="shipping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping rates & tax</CardTitle>
              <CardDescription>
                Used at checkout and on the shipping help page. Tax is applied after discounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Standard shipping rate</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={form.shippingFlat}
                  onChange={(e) => updateNumber("shippingFlat", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Fixed fee for standard (3–7 day) delivery.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Express shipping rate</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={form.shippingExpress}
                  onChange={(e) => updateNumber("shippingExpress", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Fixed fee for express (1–2 day) delivery.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Free shipping threshold</Label>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={form.shippingFreeOver}
                  onChange={(e) => updateNumber("shippingFreeOver", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Orders above this amount qualify for free standard shipping.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Tax rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={(form.taxRate * 100).toFixed(1)}
                  onChange={(e) => updateNumber("taxRate", String(parseFloat(e.target.value) / 100))}
                />
                <p className="text-xs text-muted-foreground">
                  E.g. enter 8 for 8% tax. Set to 0 to disable tax.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Currency ── */}
        <TabsContent value="currency" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Currency</CardTitle>
              <CardDescription>
                Shown across the storefront next to all prices.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Currency code</Label>
                <Input
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value.toUpperCase())}
                  placeholder="PKR"
                  maxLength={5}
                />
                <p className="text-xs text-muted-foreground">
                  ISO 4217 code, e.g. PKR, USD, GBP.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Currency symbol</Label>
                <Input
                  value={form.currencySymbol}
                  onChange={(e) => update("currencySymbol", e.target.value)}
                  placeholder="Rs"
                  maxLength={4}
                />
                <p className="text-xs text-muted-foreground">
                  Short symbol shown before prices, e.g. Rs, $, £.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={pending} className="min-w-24">
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
