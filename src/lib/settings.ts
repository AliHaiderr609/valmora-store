import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import { CURRENCY, CURRENCY_SYMBOL, SHIPPING, SITE, TAX_RATE } from "@/lib/constants";

export type AppSettings = {
  storeName: string;
  storeDescription: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
  socialYoutube: string;
  shippingFlat: number;
  shippingFreeOver: number;
  shippingExpress: number;
  taxRate: number;
  currency: string;
  currencySymbol: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  storeName: SITE.name,
  storeDescription: SITE.description,
  storeEmail: SITE.email,
  storePhone: SITE.phone,
  storeAddress: SITE.address,
  socialInstagram: SITE.social.instagram,
  socialFacebook: SITE.social.facebook,
  socialTwitter: SITE.social.twitter,
  socialYoutube: SITE.social.youtube,
  shippingFlat: SHIPPING.flat,
  shippingFreeOver: SHIPPING.freeOver,
  shippingExpress: SHIPPING.expressFlat,
  taxRate: TAX_RATE,
  currency: CURRENCY,
  currencySymbol: CURRENCY_SYMBOL,
};

export const getSettings = unstable_cache(
  async (): Promise<AppSettings> => {
    const rows = await prisma.siteSetting.findMany();
    const overrides: Record<string, unknown> = {};
    for (const row of rows) {
      if (row.key in DEFAULT_SETTINGS) {
        overrides[row.key] = row.value;
      }
    }
    return { ...DEFAULT_SETTINGS, ...(overrides as Partial<AppSettings>) };
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 300 },
);
