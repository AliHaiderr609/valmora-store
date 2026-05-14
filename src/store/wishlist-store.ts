"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WishlistItem = {
  productId: string;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  salePrice: number | null;
};

type WishlistState = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.find((x) => x.productId === item.productId);
        if (exists) {
          set((s) => ({ items: s.items.filter((x) => x.productId !== item.productId) }));
        } else {
          set((s) => ({ items: [...s.items, item] }));
        }
      },
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((x) => x.productId !== productId) })),
      has: (productId) => !!get().items.find((x) => x.productId === productId),
      clear: () => set({ items: [] }),
    }),
    { name: "valmora-wishlist", storage: createJSONStorage(() => localStorage) }
  )
);
