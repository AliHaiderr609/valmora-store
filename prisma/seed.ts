/**
 * Vailmora seed
 *
 * Run with:
 *   npm run db:seed
 *
 * Creates: admin user, brands, categories, demo products with images,
 * a hero banner, coupons, and an FAQ.
 */

import { PrismaClient, type Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

const IMG = {
  womenHero:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
  menHero:
    "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1600&q=80",
  boysHero:
    "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=1600&q=80",
  women: [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
  ],
  men: [
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
  ],
  boys: [
    "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518806118471-f28b20a1d79d?auto=format&fit=crop&w=900&q=80",
  ],
};

const SAMPLE_PRODUCTS: Array<{
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  stock: number;
  gender: Gender;
  categoryName: string;
  brandName: string;
  sizes: string[];
  colors: string[];
  fabric: string;
  material: string;
  tags: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isFlashSale?: boolean;
  images: string[];
}> = [
  {
    title: "Silk Slip Dress",
    description:
      "A timeless silhouette in 100% mulberry silk. Lined for comfort, adjustable straps, French seams.",
    shortDescription: "Mulberry silk slip with adjustable straps.",
    price: 52990,
    salePrice: 41990,
    stock: 32,
    gender: "WOMEN",
    categoryName: "Dresses",
    brandName: "Atelier Vailmora",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Gold", "Beige"],
    fabric: "100% Mulberry silk",
    material: "Silk",
    tags: ["silk", "evening", "minimal"],
    isFeatured: true,
    isFlashSale: true,
    images: [IMG.women[0], IMG.women[1]],
  },
  {
    title: "Cashmere Crew Sweater",
    description:
      "Knit from grade-A inner Mongolian cashmere with a relaxed crew neck and ribbed cuffs.",
    shortDescription: "Pure cashmere crew-neck sweater.",
    price: 64990,
    stock: 18,
    gender: "WOMEN",
    categoryName: "Knitwear",
    brandName: "Atelier Vailmora",
    sizes: ["S", "M", "L"],
    colors: ["Beige", "Black", "Gray", "Maroon"],
    fabric: "Grade-A cashmere",
    material: "Cashmere",
    tags: ["cashmere", "knit", "essential"],
    isTrending: true,
    images: [IMG.women[2], IMG.women[3]],
  },
  {
    title: "Wide-Leg Trousers",
    description:
      "Tailored wide-leg trousers in a wool blend. High waist, hidden zip closure, drapes beautifully.",
    shortDescription: "Tailored wool wide-leg trousers.",
    price: 44990,
    stock: 24,
    gender: "WOMEN",
    categoryName: "Bottoms",
    brandName: "Maison Lumiere",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Olive"],
    fabric: "Wool blend",
    material: "Wool",
    tags: ["tailored", "workwear"],
    isFeatured: true,
    images: [IMG.women[4], IMG.women[5]],
  },
  {
    title: "Wool Blazer",
    description:
      "Double-breasted wool blazer with peak lapels and tortoiseshell buttons. Fully lined.",
    shortDescription: "Double-breasted wool blazer.",
    price: 97990,
    salePrice: 78990,
    stock: 15,
    gender: "WOMEN",
    categoryName: "Outerwear",
    brandName: "Maison Lumiere",
    sizes: ["S", "M", "L"],
    colors: ["Black", "Beige"],
    fabric: "Wool blend",
    material: "Wool",
    tags: ["blazer", "tailored"],
    isTrending: true,
    isFlashSale: true,
    images: [IMG.women[1], IMG.women[3]],
  },
  // Men
  {
    title: "Slim-Fit Oxford Shirt",
    description:
      "A staple oxford shirt in soft-washed cotton. Mother-of-pearl buttons. Slim through the chest with extra room in the shoulders.",
    shortDescription: "Soft-washed cotton Oxford shirt.",
    price: 24990,
    stock: 60,
    gender: "MEN",
    categoryName: "Shirts",
    brandName: "Atelier Vailmora",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Navy", "Beige"],
    fabric: "100% Cotton",
    material: "Cotton",
    tags: ["essential", "office"],
    isFeatured: true,
    images: [IMG.men[0], IMG.men[1]],
  },
  {
    title: "Italian Wool Suit",
    description:
      "Two-piece suit cut from a super 110s Italian wool. Half-canvassed construction with surgeon cuffs.",
    shortDescription: "Italian super 110s wool suit.",
    price: 192990,
    salePrice: 153990,
    stock: 10,
    gender: "MEN",
    categoryName: "Suits",
    brandName: "Maison Lumiere",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Gray"],
    fabric: "Super 110s Italian wool",
    material: "Wool",
    tags: ["suit", "formal"],
    isFeatured: true,
    isFlashSale: true,
    images: [IMG.men[2], IMG.men[3]],
  },
  {
    title: "Premium Crew Tee",
    description:
      "Heavy-weight 240gsm cotton crew tee with a clean rolled hem. Pre-shrunk and built to outlast.",
    shortDescription: "240gsm heavyweight cotton tee.",
    price: 10990,
    stock: 200,
    gender: "MEN",
    categoryName: "T-Shirts",
    brandName: "Atelier Vailmora",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Black", "Gray", "Olive"],
    fabric: "100% Cotton",
    material: "Cotton",
    tags: ["essential", "everyday"],
    isTrending: true,
    images: [IMG.men[4], IMG.men[5]],
  },
  {
    title: "Tailored Chinos",
    description:
      "Mid-rise chinos in a brushed twill. Slight stretch, slim through the leg.",
    shortDescription: "Brushed twill mid-rise chinos.",
    price: 27990,
    stock: 80,
    gender: "MEN",
    categoryName: "Bottoms",
    brandName: "Atelier Vailmora",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Navy", "Olive"],
    fabric: "Cotton stretch",
    material: "Cotton",
    tags: ["chinos", "essential"],
    images: [IMG.men[1], IMG.men[0]],
  },
  // Boys
  {
    title: "Adventurer Hoodie",
    description:
      "Soft fleece hoodie with kangaroo pocket. Reinforced cuffs and a draw-cord hood.",
    shortDescription: "Soft fleece kids' hoodie.",
    price: 13990,
    stock: 100,
    gender: "BOYS",
    categoryName: "Hoodies",
    brandName: "Little Vailmora",
    sizes: ["S", "M", "L"],
    colors: ["Black", "Olive", "Navy"],
    fabric: "Fleece-back jersey",
    material: "Cotton blend",
    tags: ["kids", "casual"],
    isFeatured: true,
    images: [IMG.boys[0], IMG.boys[1]],
  },
  {
    title: "Explorer Cargo Pants",
    description:
      "Durable cargo pants with elastic ankles. Six pockets to carry whatever the day brings.",
    shortDescription: "Durable kids' cargo pants.",
    price: 16990,
    salePrice: 10990,
    stock: 70,
    gender: "BOYS",
    categoryName: "Bottoms",
    brandName: "Little Vailmora",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Olive", "Beige", "Black"],
    fabric: "Cotton twill",
    material: "Cotton",
    tags: ["cargo", "kids"],
    isTrending: true,
    isFlashSale: true,
    images: [IMG.boys[2], IMG.boys[3]],
  },
  {
    title: "Striped Polo",
    description:
      "Classic striped polo in soft pique cotton. Designed to look smart and play hard.",
    shortDescription: "Soft pique cotton polo for kids.",
    price: 9990,
    stock: 150,
    gender: "BOYS",
    categoryName: "T-Shirts",
    brandName: "Little Vailmora",
    sizes: ["S", "M", "L"],
    colors: ["White", "Navy"],
    fabric: "Cotton pique",
    material: "Cotton",
    tags: ["polo", "kids"],
    isFeatured: true,
    images: [IMG.boys[1], IMG.boys[0]],
  },
];

async function main() {
  console.log("→ Seeding Vailmora...");

  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@Vailmora.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN", name: "Vailmora Admin" },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Vailmora Admin",
      role: "ADMIN",
    },
  });
  console.log(`✓ Admin user: ${adminEmail} / ${adminPassword}`);

  // Brands
  const brandData = ["Atelier Vailmora", "Maison Lumiere", "Little Vailmora"];
  for (const name of brandData) {
    await prisma.brand.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  // Categories
  const categoriesData: { name: string; gender: Gender }[] = [
    { name: "Dresses", gender: "WOMEN" },
    { name: "Knitwear", gender: "WOMEN" },
    { name: "Outerwear", gender: "WOMEN" },
    { name: "Bottoms", gender: "WOMEN" },
    { name: "Shirts", gender: "MEN" },
    { name: "Suits", gender: "MEN" },
    { name: "T-Shirts", gender: "MEN" },
    { name: "Bottoms", gender: "MEN" },
    { name: "Hoodies", gender: "BOYS" },
    { name: "T-Shirts", gender: "BOYS" },
    { name: "Bottoms", gender: "BOYS" },
  ];
  for (const c of categoriesData) {
    const slug = `${slugify(c.name)}-${c.gender.toLowerCase()}`;
    await prisma.category.upsert({
      where: { slug },
      update: { name: c.name, gender: c.gender },
      create: { name: c.name, slug, gender: c.gender },
    });
  }
  console.log("✓ Brands + categories seeded");

  // Products
  for (const p of SAMPLE_PRODUCTS) {
    const slug = `${slugify(p.title)}`;
    const sku = `VLM-${slugify(p.brandName).toUpperCase().slice(0, 4)}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    const category = await prisma.category.findFirst({
      where: { name: p.categoryName, gender: p.gender },
    });
    const brand = await prisma.brand.findUnique({ where: { slug: slugify(p.brandName) } });
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug },
      update: {
        price: p.price,
        salePrice: p.salePrice ?? null,
      },
      create: {
        title: p.title,
        slug,
        sku,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        gender: p.gender,
        sizes: p.sizes,
        colors: p.colors,
        tags: p.tags,
        fabric: p.fabric,
        material: p.material,
        categoryId: category.id,
        brandId: brand?.id ?? null,
        isFeatured: p.isFeatured ?? false,
        isTrending: p.isTrending ?? false,
        isFlashSale: p.isFlashSale ?? false,
        flashSaleEndsAt: p.isFlashSale
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : null,
        status: "ACTIVE",
        images: {
          create: p.images.map((url, idx) => ({
            url,
            order: idx,
            isMain: idx === 0,
          })),
        },
      },
    });
  }
  console.log(`✓ ${SAMPLE_PRODUCTS.length} products seeded`);

  // Banners
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        title: "Effortless Luxury, Redefined",
        subtitle: "The new season collection is here. Premium fabrics, timeless silhouettes.",
        image: IMG.womenHero,
        link: "/women",
        cta: "Shop Women",
        position: "home_hero",
        order: 0,
      },
      {
        title: "Crafted for the Modern Man",
        subtitle: "Tailored fits and elevated essentials for every occasion.",
        image: IMG.menHero,
        link: "/men",
        cta: "Shop Men",
        position: "home_hero",
        order: 1,
      },
      {
        title: "Little Trends, Big Moments",
        subtitle: "Comfortable, playful clothing for boys who are always on the move.",
        image: IMG.boysHero,
        link: "/boys",
        cta: "Shop Boys",
        position: "home_hero",
        order: 2,
      },
    ],
  });
  console.log("✓ Banners seeded");

  // Coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: { minOrder: 15000 },
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "PERCENTAGE",
      value: 10,
      minOrder: 15000,
      isActive: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      description: "Free shipping on any order",
      type: "FREE_SHIPPING",
      value: 0,
      isActive: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "EID25" },
    update: { maxDiscount: 5000 },
    create: {
      code: "EID25",
      description: "Eid sale — 25% off",
      type: "PERCENTAGE",
      value: 25,
      maxDiscount: 5000,
      isActive: true,
    },
  });
  console.log("✓ Coupons seeded");

  // FAQ
  await prisma.fAQ.deleteMany({});
  await prisma.fAQ.createMany({
    data: [
      {
        question: "What is your return policy?",
        answer: "Unworn items can be returned within 30 days for a full refund.",
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to over 100 countries. Shipping fees are calculated at checkout.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once your order ships you'll receive an email with a tracking link. You can also view tracking in your account.",
      },
    ],
  });
  console.log("✓ FAQ seeded");

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
