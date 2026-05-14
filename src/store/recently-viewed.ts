"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ViewedItem = {
  productId: string;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  salePrice: number | null;
};

type State = {
  items: ViewedItem[];
  push: (item: ViewedItem) => void;
  clear: () => void;
};

export const useRecentlyViewed = create<State>()(
  persist(
    (set) => ({
      items: [],
      push: (item) =>
        set((s) => {
          const dedup = s.items.filter((x) => x.productId !== item.productId);
          return { items: [item, ...dedup].slice(0, 12) };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "valmora-recent", storage: createJSONStorage(() => localStorage) }
  )
);
