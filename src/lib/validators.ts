import { z } from "zod";

// ============================
// AUTH
// ============================

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ============================
// ADDRESS
// ============================

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(2),
  country: z.string().default("US"),
  type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
});

// ============================
// PRODUCT
// ============================

export const productSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().min(10),
  shortDescription: z.string().optional(),
  sku: z.string().optional(),
  brandId: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  gender: z.enum(["MEN", "WOMEN", "BOYS", "UNISEX"]).default("UNISEX"),
  tags: z.array(z.string()).default([]),
  price: z.number().nonnegative(),
  salePrice: z.number().nonnegative().optional().nullable(),
  costPrice: z.number().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  lowStockAlert: z.number().int().nonnegative().default(5),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  fabric: z.string().optional(),
  material: z.string().optional(),
  weight: z.number().optional(),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isFlashSale: z.boolean().default(false),
  flashSaleEndsAt: z.string().datetime().optional().nullable(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        isMain: z.boolean().default(false),
      })
    )
    .default([]),
});

// ============================
// CART / CHECKOUT
// ============================

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email().optional(),
  items: z.array(cartItemSchema).min(1),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(["STRIPE", "COD"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

// ============================
// COUPON
// ============================

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z.number().nonnegative(),
  minOrder: z.number().nonnegative().optional().nullable(),
  maxDiscount: z.number().nonnegative().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
  appliesToAll: z.boolean().default(true),
  productIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
});

// ============================
// CATEGORY / BRAND
// ============================

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional().nullable(),
  banner: z.string().url().optional().nullable(),
  gender: z.enum(["MEN", "WOMEN", "BOYS", "UNISEX"]).optional().nullable(),
  parentId: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

export const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  logo: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

// ============================
// REVIEW
// ============================

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5),
});

// ============================
// BANNER / PAGE
// ============================

export const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  image: z.string().url(),
  mobileImage: z.string().url().optional().nullable(),
  link: z.string().optional(),
  cta: z.string().optional(),
  position: z.string().default("home_hero"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
