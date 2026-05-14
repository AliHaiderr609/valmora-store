"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { COLORS, SIZES, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Gender } from "@prisma/client";

type Props = {
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
  gender?: Gender;
};

export function ProductFilters({ categories, brands, gender }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = (key: string, value?: string) => {
    const np = new URLSearchParams(params.toString());
    if (value && value.length > 0) np.set(key, value);
    else np.delete(key);
    np.delete("page");
    router.push(`${pathname}?${np.toString()}`);
  };

  const toggleInList = (key: string, value: string) => {
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    set(key, next.join(","));
  };

  const [minPrice, setMinPrice] = React.useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = React.useState(params.get("maxPrice") ?? "");

  React.useEffect(() => {
    setMinPrice(params.get("minPrice") ?? "");
    setMaxPrice(params.get("maxPrice") ?? "");
  }, [params]);

  const applyPrice = () => {
    const np = new URLSearchParams(params.toString());
    if (minPrice) np.set("minPrice", minPrice);
    else np.delete("minPrice");
    if (maxPrice) np.set("maxPrice", maxPrice);
    else np.delete("maxPrice");
    np.delete("page");
    router.push(`${pathname}?${np.toString()}`);
  };

  const activeCategories = params.get("category")?.split(",").filter(Boolean) ?? [];
  const activeBrands = params.get("brand")?.split(",").filter(Boolean) ?? [];
  const activeSizes = params.get("size")?.split(",").filter(Boolean) ?? [];
  const activeColors = params.get("color")?.split(",").filter(Boolean) ?? [];

  const hasFilters =
    activeCategories.length ||
    activeBrands.length ||
    activeSizes.length ||
    activeColors.length ||
    params.get("minPrice") ||
    params.get("maxPrice") ||
    params.get("onSale") ||
    params.get("isNew") ||
    params.get("inStock");

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
            className="h-7 px-2 text-xs"
          >
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sort by
        </p>
        <select
          value={params.get("sort") ?? "latest"}
          onChange={(e) => set("sort", e.target.value === "latest" ? "" : e.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <Separator />

      {!gender && categories.length > 0 && (
        <FilterGroup title="Category">
          {categories.map((c) => {
            const active = activeCategories.includes(c.slug);
            return (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleInList("category", c.slug)}
                  className="rounded border-input"
                />
                {c.name}
              </label>
            );
          })}
        </FilterGroup>
      )}

      {brands.length > 0 && (
        <FilterGroup title="Brand">
          {brands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={activeBrands.includes(b.slug)}
                onChange={() => toggleInList("brand", b.slug)}
                className="rounded border-input"
              />
              {b.name}
            </label>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9"
          />
        </div>
        <Button size="sm" variant="outline" className="mt-2 w-full" onClick={applyPrice}>
          Apply
        </Button>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleInList("size", s)}
              className={cn(
                "rounded-md border py-1.5 text-xs font-medium hover:border-foreground",
                activeSizes.includes(s) && "border-foreground bg-foreground text-background"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const active = activeColors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleInList("color", c.name)}
                aria-label={c.name}
                title={c.name}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-all",
                  active ? "border-foreground" : "border-transparent ring-1 ring-border"
                )}
                style={{ backgroundColor: c.value }}
              />
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="More">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={params.get("onSale") === "true"}
            onChange={(e) => set("onSale", e.target.checked ? "true" : "")}
            className="rounded"
          />
          On sale
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={params.get("isNew") === "true"}
            onChange={(e) => set("isNew", e.target.checked ? "true" : "")}
            className="rounded"
          />
          New arrivals
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={params.get("inStock") === "true"}
            onChange={(e) => set("inStock", e.target.checked ? "true" : "")}
            className="rounded"
          />
          In stock only
        </label>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
