import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return err("Unauthorized", 401);
    }
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return ok(coupons);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return err("Unauthorized", 401);
    }
    const body = await req.json();
    const data = couponSchema.parse(body);
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    return ok(coupon);
  } catch (e) {
    return handleError(e);
  }
}
