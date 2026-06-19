import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listProducts, parseProductQuery } from "@/lib/services/products";
import { productSchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";
import {
  notifySubscribersProductSale,
  productHasSale,
  queueNewsletterEmail,
} from "@/lib/newsletter-email";
import { generateSku, slugify, toNumber } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const result = await listProducts(parseProductQuery(url.searchParams));
    return ok(result);
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
    const data = productSchema.parse(body);

    const slug = data.slug && data.slug.length > 0 ? slugify(data.slug) : slugify(data.title);
    const sku = data.sku && data.sku.length > 0 ? data.sku : generateSku();

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        sku,
        brandId: data.brandId || null,
        categoryId: data.categoryId,
        gender: data.gender,
        tags: data.tags,
        price: data.price,
        salePrice: data.salePrice ?? null,
        costPrice: data.costPrice ?? null,
        stock: data.stock,
        lowStockAlert: data.lowStockAlert,
        sizes: data.sizes,
        colors: data.colors,
        fabric: data.fabric,
        material: data.material,
        weight: data.weight,
        isFeatured: data.isFeatured,
        isTrending: data.isTrending,
        isFlashSale: data.isFlashSale,
        flashSaleEndsAt: data.flashSaleEndsAt ? new Date(data.flashSaleEndsAt) : null,
        seoTitle: data.seoTitle,
        seoDesc: data.seoDesc,
        status: data.status,
        images: {
          create: data.images.map((img, idx) => ({
            url: img.url,
            alt: img.alt,
            order: idx,
            isMain: img.isMain || idx === 0,
          })),
        },
      },
      include: { images: true, brand: true, category: true },
    });

    if (productHasSale(product)) {
      queueNewsletterEmail(
        () => notifySubscribersProductSale(product),
        `product sale broadcast (${product.slug})`
      );
    }

    return ok({
      ...product,
      price: toNumber(product.price),
      salePrice: product.salePrice ? toNumber(product.salePrice) : null,
    });
  } catch (e) {
    return handleError(e);
  }
}
