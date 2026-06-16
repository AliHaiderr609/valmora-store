export const SITE = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Vailmora",
  description:
    "Vailmora — premium dynamic fashion for Men, Women and Boys. Discover curated collections, latest trends, and exclusive seasonal sales.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  email: "support@valmora.com",
  phone: "+1 (555) 010-0100",
  address: "123 Fashion Ave, New York, NY 10001",
  social: {
    instagram: "https://instagram.com/valmora",
    facebook: "https://facebook.com/valmora",
    twitter: "https://twitter.com/valmora",
    youtube: "https://youtube.com/@valmora",
  },
};

export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "PKR";
export const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? "Rs";

export const SHIPPING = {
  freeOver: 100,
  flat: 9.99,
  expressFlat: 19.99,
};

export const TAX_RATE = 0.08;

export const GENDERS = [
  { value: "MEN", label: "Men", href: "/men" },
  { value: "WOMEN", label: "Women", href: "/women" },
  { value: "BOYS", label: "Boys", href: "/boys" },
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#6B7280" },
  { name: "Navy", value: "#1E3A8A" },
  { name: "Beige", value: "#D4B895" },
  { name: "Olive", value: "#556B2F" },
  { name: "Maroon", value: "#7B1E2E" },
  { name: "Gold", value: "#D49829" },
] as const;

export const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
  { value: "rating", label: "Highest Rated" },
] as const;

export const ORDER_STATUS_FLOW = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;
