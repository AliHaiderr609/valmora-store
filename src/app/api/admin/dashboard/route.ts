import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err, handleError, ok } from "@/lib/api";
import { toNumber } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return err("Unauthorized", 401);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueAgg,
      monthlyRevenueAgg,
      recentOrders,
      lowStockProducts,
      topProducts,
      ordersByDay,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, status: "ACTIVE" },
        take: 10,
        orderBy: { stock: "asc" },
        select: { id: true, title: true, slug: true, stock: true, sku: true },
      }),
      prisma.product.findMany({
        take: 6,
        orderBy: { soldCount: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          soldCount: true,
          price: true,
          images: { take: 1, orderBy: { order: "asc" } },
        },
      }),
      prisma.$queryRaw<{ day: Date; total: number; count: bigint }[]>`
        SELECT
          DATE_TRUNC('day', "createdAt") AS day,
          SUM("total")::float AS total,
          COUNT(*) AS count
        FROM "Order"
        WHERE "createdAt" >= ${thirtyDaysAgo} AND "paymentStatus" = 'PAID'
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ]);

    return ok({
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue: toNumber(revenueAgg._sum.total ?? 0),
      monthlyRevenue: toNumber(monthlyRevenueAgg._sum.total ?? 0),
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: toNumber(o.total),
      })),
      lowStockProducts,
      topProducts: topProducts.map((p) => ({ ...p, price: toNumber(p.price) })),
      ordersByDay: ordersByDay.map((d) => ({
        day: d.day.toISOString().slice(0, 10),
        total: Number(d.total ?? 0),
        count: Number(d.count),
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
