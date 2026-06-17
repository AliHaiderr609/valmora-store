# Vailmora — Premium Fashion E-Commerce Platform

A production-quality, full-stack fashion e-commerce platform for **Men, Women and Boys**, built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma + PostgreSQL**, **NextAuth.js**, and **Stripe**.

> Store name: **Vailmora**
> Customer storefront, customer accounts, full admin dashboard, secure payments, CMS-managed content, SEO, and more — all in one codebase.

---

## Highlights

- **Next.js 15** with the App Router and React Server Components
- **TypeScript** end-to-end + strict types via Prisma
- **Tailwind CSS** with shadcn-style primitives and a polished, premium UI
- **Framer Motion** for animations
- **Zustand** for cart, wishlist, and recently-viewed (persisted in `localStorage`)
- **Prisma ORM** with a comprehensive PostgreSQL schema (Users, Products, Orders, Coupons, CMS, Blog, …)
- **NextAuth v5** with Credentials + (optional) Google provider
- **JWT-based sessions** + role-based middleware for `/admin` and `/account`
- **Stripe Checkout** + webhook handler, plus **Cash on Delivery**
- **Cloudinary** image uploads (with a clean image upload UI)
- **Server-side pricing engine** (subtotal → discount → shipping → tax → total) used both by `/api/orders` and `/api/coupons/validate`
- Coupons: percentage, fixed amount, free shipping
- **Admin dashboard** with KPIs, revenue chart, low-stock alerts, top products, recent orders
- Product CRUD, category CRUD, order management (status + tracking), coupon CRUD, banner CMS
- **SEO**: dynamic metadata, OpenGraph, Twitter, JSON-LD product schema, dynamic `sitemap.ts` + `robots.ts`
- **Responsive, mobile-first design** with dark/light theme toggle
- Email notifications (Nodemailer / SMTP)
- Newsletter signup, customer reviews, wishlists
- Rate limiting on auth + newsletter endpoints
- Seed script that loads brands, categories, 11 sample products, 3 hero banners, coupons, FAQ, and an admin user

---

## Tech stack

| Area              | Tools                                           |
| ----------------- | ----------------------------------------------- |
| Frontend          | Next.js 15, React 19, TypeScript, Tailwind, Framer Motion |
| UI primitives     | Radix UI + custom shadcn-style components       |
| State             | Zustand (persisted)                             |
| Backend / APIs    | Next.js Route Handlers (REST)                   |
| ORM / DB          | Prisma + PostgreSQL                             |
| Auth              | NextAuth.js v5 (Credentials + Google)           |
| Payments          | Stripe Checkout + Webhooks, Cash on Delivery    |
| Images            | Cloudinary                                      |
| Email             | Nodemailer (SMTP — Resend, SendGrid, etc.)      |
| Charts            | Recharts                                        |
| Validation        | Zod                                             |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/                # /login, /register
│   ├── (shop)/                # Public store: home, products, cart, checkout, account, ...
│   ├── admin/                 # Admin dashboard (RBAC-protected)
│   ├── api/                   # REST APIs
│   ├── sitemap.ts, robots.ts  # SEO
│   └── layout.tsx
├── components/
│   ├── ui/                    # shadcn-style primitives
│   ├── layout/                # Header, footer, mobile nav
│   ├── home/                  # Hero banner, flash sale, sections
│   ├── products/              # Card, grid, filters, gallery, reviews
│   ├── cart/                  # Cart drawer
│   └── admin/                 # Sidebar, charts, forms
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── auth.ts                # NextAuth config + types
│   ├── stripe.ts              # Stripe SDK
│   ├── cloudinary.ts          # Image upload helpers
│   ├── email.ts               # SMTP transporter + templates
│   ├── pricing.ts             # Cart pricing + coupon engine
│   ├── rate-limit.ts          # In-memory token bucket
│   ├── services/products.ts   # Product queries + filter parsing
│   ├── validators.ts          # Zod schemas
│   └── constants.ts, utils.ts
├── store/                     # Zustand stores
├── middleware.ts              # RBAC guard for /admin, /account, /api/admin
└── types/
prisma/
├── schema.prisma
└── seed.ts
```

---

## Getting started

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

(`--legacy-peer-deps` keeps the install resilient if any optional package has slightly different React peer ranges.)

### 2. Configure environment

Copy the template and fill in values:

```bash
cp .env.example .env
```

At minimum you need `DATABASE_URL` and `AUTH_SECRET`. Generate a secret with:

```bash
openssl rand -base64 32
```

### 3. Set up the database

This works against any PostgreSQL instance (local, **Neon**, **Supabase**, **Railway**, etc.):

```bash
# Push the schema (creates tables)
npm run db:push

# OR, for a versioned migration history:
npm run db:migrate

# Seed with demo data
npm run db:seed
```

The seed script creates:

- An admin user — credentials come from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (default `admin@Vailmora.com` / `ChangeMe123!`)
- 3 brands, 11 categories
- 11 demo products with multiple images, colors, sizes — across Men / Women / Boys
- 3 hero banners
- Coupons: `WELCOME10`, `FREESHIP`, `EID25`
- FAQ entries

### 4. Run the dev server

```bash
npm run dev
```

Visit:

- Storefront: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> (sign in as `admin@Vailmora.com`)

### 5. Configure optional integrations

Edit `.env` to enable any of the following.

| Feature        | Variables                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Google OAuth   | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`                                                          |
| Stripe         | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`              |
| Cloudinary     | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`                           |
| Email (SMTP)   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`                              |

If any of these are missing, the app **fails gracefully**:
- Image uploads return a clear error,
- Email sends are skipped with a console warning,
- Stripe checkout returns an error if you choose the Stripe payment method without configuring it (COD continues to work).

---

## Stripe webhooks

Forward webhook events to your local dev server:

```bash
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

The handler in `src/app/api/payments/stripe/webhook/route.ts` listens for:

- `checkout.session.completed` → marks order as **PAID** + **PROCESSING**, records payment, emails the customer
- `payment_intent.payment_failed` → marks payment as **FAILED**

---

## API reference

All routes return `{ ok: true, data }` on success or `{ ok: false, error, details? }` with a 4xx/5xx status on failure.

### Auth
- `POST /api/auth/register` — create a customer account
- `GET/POST /api/auth/[...nextauth]` — NextAuth handlers

### Catalog
- `GET /api/products` — list with filters (`category`, `brand`, `size`, `color`, `gender`, `minPrice`, `maxPrice`, `onSale`, `isNew`, `inStock`, `isFeatured`, `isTrending`, `isFlashSale`, `sort`, `page`, `limit`, `q`)
- `POST /api/products` — admin/staff create
- `GET/PATCH/DELETE /api/products/[id]`
- `GET/POST /api/categories`, `PATCH/DELETE /api/categories/[id]`
- `GET/POST /api/brands`
- `GET /api/search?q=…`

### Cart / Orders
- `POST /api/coupons/validate` — applies coupon and returns full pricing breakdown
- `POST /api/orders` — checkout (creates order, decrements stock, returns Stripe URL or COD confirmation)
- `GET /api/orders` — list (customer = own orders, staff/admin = all)
- `GET/PATCH /api/orders/[id]` — staff can update status, payment, tracking, carrier

### Reviews / Wishlist
- `GET /api/reviews?productId=…`
- `POST /api/reviews` (auth required)

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/customers`
- `POST /api/upload` — Cloudinary upload (admin only)
- `POST /api/banners`, `GET /api/banners?position=…`

### Misc
- `POST /api/newsletter`
- `POST /api/payments/stripe/webhook`

---

## Customizing & extending

| You want to…                                | File / area                                                  |
| ------------------------------------------- | ------------------------------------------------------------ |
| Change brand colors, fonts                  | `tailwind.config.ts`, `src/app/globals.css`, `src/lib/constants.ts` |
| Update the homepage layout                  | `src/app/(shop)/page.tsx` + `src/components/home/*`          |
| Add a new payment method                    | Extend the `PaymentMethod` enum + add a branch in `POST /api/orders` |
| Switch image storage to S3                  | Replace `src/lib/cloudinary.ts` (interface is small)         |
| Replace email transport                     | Swap `nodemailer` for the SDK of your choice in `src/lib/email.ts` |
| Upgrade rate limiting for production scale  | Replace `src/lib/rate-limit.ts` with Upstash Redis           |

---

## Deployment

### Vercel (recommended for the app)

1. Push the repo to GitHub.
2. Create a new Vercel project from the repo.
3. Add all environment variables from `.env.example`.
4. Set the **build command** to `npm run build` and the **install command** to `npm install --legacy-peer-deps`.
5. Add a Stripe webhook in the Stripe dashboard pointing to:
   `https://YOUR_DOMAIN/api/payments/stripe/webhook`

### Database hosts

Pick any of the following and put the connection string in `DATABASE_URL`:
- **Neon** – serverless Postgres, generous free tier
- **Supabase** – Postgres + auth (we use our own auth)
- **Railway** – great DX
- **AWS RDS / GCP Cloud SQL** – for enterprise

After deploying, run:

```bash
npm run db:push     # apply schema
npm run db:seed     # (optional) seed demo data
```

---

## Security checklist

- ✔ Passwords hashed with bcrypt (12 rounds)
- ✔ JWT sessions over HTTP-only cookies (`secureCookie` on production)
- ✔ Server-side role check via middleware on `/admin`, `/account`, `/api/admin`
- ✔ Zod validation on every mutating API route
- ✔ Rate limiting on `/api/auth/register` and `/api/newsletter`
- ✔ Server-side pricing (clients can't tamper with totals)
- ✔ Server-side stock decrement inside a transaction
- ✔ Secure security headers configured in `next.config.mjs`
- ✔ Stripe webhook signature verification

---

## Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Run dev server                       |
| `npm run build`    | Build for production                 |
| `npm run start`    | Run the production server            |
| `npm run lint`     | Lint                                 |
| `npm run typecheck`| Type-check without building          |
| `npm run db:push`  | Sync Prisma schema to DB             |
| `npm run db:migrate` | Generate + apply a Prisma migration |
| `npm run db:studio`| Open Prisma Studio                   |
| `npm run db:seed`  | Run the seed script                  |

---

## Roadmap (intentionally left as scaffolding hooks)

These are wired into the data model and codebase so they can be implemented incrementally:

- AI product recommendations (use `soldCount`, `tags`, `categoryId` to compute similarity)
- Multi-currency / multi-language (currency in `SiteSetting`, i18n via `next-intl`)
- Live chat (drop in Intercom/Crisp)
- Loyalty points (already on `User.loyaltyPoints`)
- Referral system + abandoned-cart recovery (extend `Notification` + cron)

---

## License

Proprietary — © Vailmora. All rights reserved.
