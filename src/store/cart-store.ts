"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  productId: string;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  quantity: number;
  size?: string;
  color?: string;
  stock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (productId: string, size?: string, color?: string) => void;
  updateQty: (productId: string, qty: number, size?: string, color?: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  subtotal: () => number;
  count: () => number;
};

const matches = (a: CartItem, b: { productId: string; size?: string; color?: string }) =>
  a.productId === b.productId && a.size === b.size && a.color === b.color;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          const existing = s.items.find((x) => matches(x, item));
          if (existing) {
            return {
              items: s.items.map((x) =>
                matches(x, item)
                  ? { ...x, quantity: Math.min(x.stock, x.quantity + item.quantity) }
                  : x
              ),
              isOpen: true,
            };
          }
          return { items: [...s.items, item], isOpen: true };
        }),
      remove: (productId, size, color) =>
        set((s) => ({
          items: s.items.filter((x) => !matches(x, { productId, size, color })),
        })),
      updateQty: (productId, qty, size, color) =>
        set((s) => ({
          items: s.items.map((x) =>
            matches(x, { productId, size, color })
              ? { ...x, quantity: Math.max(1, Math.min(x.stock, qty)) }
              : x
          ),
        })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + (i.salePrice ?? i.price) * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "valmora-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    }
  )
);
