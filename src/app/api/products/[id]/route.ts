import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";
import {
  isNewOrImprovedSale,
  notifySubscribersProductSale,
  queueNewsletterEmail,
} from "@/lib/newsletter-email";
import { toNumber } from "@/lib/utils";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return null;
  }
  return session;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, brand: true, category: true },
    });
    if (!product) return err("Not found", 404);
    return ok({
      ...product,
      price: toNumber(product.price),
      salePrice: product.salePrice ? toNumber(product.salePrice) : null,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;
    const body = await req.json();
    const data = productSchema.partial().parse(body);

    const before = await prisma.product.findUnique({
      where: { id },
      select: { salePrice: true, isFlashSale: true },
    });
    if (!before) return err("Not found", 404);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        brandId: data.brandId === undefined ? undefined : data.brandId || null,
        flashSaleEndsAt:
          data.flashSaleEndsAt === undefined
            ? undefined
            : data.flashSaleEndsAt
            ? new Date(data.flashSaleEndsAt)
            : null,
        images: data.images
          ? {
              deleteMany: {},
              create: data.images.map((img, idx) => ({
                url: img.url,
                alt: img.alt,
                order: idx,
                isMain: img.isMain || idx === 0,
              })),
            }
          : undefined,
      },
      include: { images: true, brand: true, category: true },
    });

    if (
      isNewOrImprovedSale(before, {
        salePrice: updated.salePrice,
        isFlashSale: updated.isFlashSale,
      })
    ) {
      queueNewsletterEmail(
        () => notifySubscribersProductSale(updated),
        `product sale broadcast (${updated.slug})`
      );
    }

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) return err("Unauthorized", 401);
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}
