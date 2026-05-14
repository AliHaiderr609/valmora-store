import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err, handleError, ok, parsePagination } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return err("Unauthorized", 401);
    }

    const url = new URL(req.url);
    const { page, limit, skip } = parsePagination(url.searchParams);
    const q = url.searchParams.get("q") ?? "";

    const where = {
      role: "CUSTOMER" as const,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isBlocked: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return ok({ items, total, page, limit, pages: Math.ceil(total / limit) || 1 });
  } catch (e) {
    return handleError(e);
  }
}
