"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartState, CartItem } from "@/types";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      /** Add one BOX of the given variant */
      addBox: (item: Omit<CartItem, "quantity">) => {
        const existing = get().items.find(
          (i) => i.variantId === item.variantId
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },

      /** Remove variant from cart entirely */
      removeBox: (variantId: string) => {
        set({
          items: get().items.filter((i) => i.variantId !== variantId),
        });
      },

      /** Subtract one box; if quantity hits 0, remove */
      decrementBox: (variantId: string) => {
        const existing = get().items.find((i) => i.variantId === variantId);
        if (!existing) return;
        if (existing.quantity <= 1) {
          get().removeBox(variantId);
        } else {
          set({
            items: get().items.map((i) =>
              i.variantId === variantId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      /** Total number of boxes across all items */
      totalBoxes: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      /** Total individual pieces (boxes × piecesPerBox) */
      totalPieces: () =>
        get().items.reduce(
          (sum, i) => sum + i.quantity * i.piecesPerBox,
          0
        ),

      /** Total price in ₽ (boxes × boxPrice) */
      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.quantity * i.boxPrice,
          0
        ),
    }),
    {
      name: "forte-cup-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
