import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartStore, CartState } from "./types";
import {
  createCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
} from "@/lib/shopify/cart";

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  shopifyCartId: null,
  shopifyCheckoutUrl: null,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: async (item) => {
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

        // Sync with Shopify
        const state = get();
        if (!state.shopifyCartId) {
          const cartResult = await createCart();
          if (cartResult) {
            set({
              shopifyCartId: cartResult.cartId,
              shopifyCheckoutUrl: cartResult.checkoutUrl,
            });
          }
        }

        // Add item to Shopify cart
        const updatedState = get();
        if (updatedState.shopifyCartId) {
          await addToCart(updatedState.shopifyCartId, item.variantId, 1);
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      removeAllItems: () => set({ items: [] }),

      updateQuantity: async (id, quantity) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
          ),
        });

        // Sync with Shopify (simplified - in a real app you'd track Shopify line IDs)
        const state = get();
        if (state.shopifyCartId) {
          // For now, we'll just recreate the cart with current items
          // In a production app, you'd track Shopify line IDs properly
          console.log(
            "Quantity updated locally, Shopify sync would happen here"
          );
        }
      },

      clearCart: () => set({ items: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + (i.price?.amount || 0) * i.quantity,
          0
        ),

      // Shopify cart management
      setShopifyCart: (cartId: string, checkoutUrl: string) =>
        set({ shopifyCartId: cartId, shopifyCheckoutUrl: checkoutUrl }),

      syncWithShopify: async () => {
        const state = get();

        // If no Shopify cart exists, create one
        if (!state.shopifyCartId) {
          const cartResult = await createCart();
          if (cartResult) {
            set({
              shopifyCartId: cartResult.cartId,
              shopifyCheckoutUrl: cartResult.checkoutUrl,
            });
          }
        }
      },

      checkout: () => {
        const state = get();
        if (state.shopifyCheckoutUrl) {
          window.location.href = state.shopifyCheckoutUrl;
        }
      },
    }),
    { name: "cart-storage" }
  )
);
