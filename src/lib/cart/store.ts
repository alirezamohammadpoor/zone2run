import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartStore, CartState } from "./types";

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
          ),
        }),

      clearCart: () => set({ items: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + (i.price?.amount || 0) * i.quantity,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);
