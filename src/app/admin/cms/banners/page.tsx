import { prisma } from "@/lib/prisma";
import { BannersClient } from "@/components/admin/banners-client";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">CMS · Banners</h1>
        <p className="text-sm text-muted-foreground">
          Hero sliders and promotional banners shown across the storefront.
        </p>
      </header>
      <BannersClient initial={banners} />
    </div>
  );
}
