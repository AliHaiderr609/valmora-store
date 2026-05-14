import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderEditor } from "@/components/admin/order-editor";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingAddress: true,
      billingAddress: true,
      payments: true,
      user: true,
    },
  });
  if (!order) notFound();
  return <OrderEditor order={order as any} />;
}
