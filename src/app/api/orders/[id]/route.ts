import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err, handleError, ok } from "@/lib/api";
import { z } from "zod";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return err("Unauthorized", 401);
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
        payments: true,
      },
    });
    if (!order) return err("Not found", 404);
    const isOwner = order.userId === session.user.id;
    const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
    if (!isOwner && !isStaff) return err("Forbidden", 403);
    return ok(order);
  } catch (e) {
    return handleError(e);
  }
}

const updateSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return err("Unauthorized", 401);
    }
    const { id } = await params;
    const data = updateSchema.parse(await req.json());
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...data,
        deliveredAt: data.status === "DELIVERED" ? new Date() : undefined,
        cancelledAt: data.status === "CANCELLED" ? new Date() : undefined,
      },
    });
    return ok(order);
  } catch (e) {
    return handleError(e);
  }
}
