export type ProductListItem = {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
  stock: number;
  gender: "MEN" | "WOMEN" | "BOYS" | "UNISEX";
  sizes: string[];
  colors: string[];
  brand?: { name: string; slug: string } | null;
  category: { name: string; slug: string };
  images: { url: string; alt?: string | null }[];
};

export type ProductDetail = ProductListItem & {
  description: string;
  shortDescription?: string | null;
  sku: string;
  fabric?: string | null;
  material?: string | null;
  weight?: number | null;
  tags: string[];
  flashSaleEndsAt: Date | string | null;
  seoTitle?: string | null;
  seoDesc?: string | null;
};
