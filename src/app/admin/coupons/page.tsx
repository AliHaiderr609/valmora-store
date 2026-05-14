import { prisma } from "@/lib/prisma";
import { CouponsClient } from "@/components/admin/coupons-client";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          Discount codes and promotional offers.
        </p>
      </header>
      <CouponsClient
        initial={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          value: toNumber(c.value),
          minOrder: c.minOrder ? toNumber(c.minOrder) : null,
          isActive: c.isActive,
          usedCount: c.usedCount,
          expiresAt: c.expiresAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
