"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartStore, CartState } from "./types";
import {
  createCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  getCart,
} from "@/lib/shopify/cart";

import { DEFAULT_COUNTRY } from "@/lib/locale/countries";

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  shopifyCartId: null,
  shopifyCheckoutUrl: null,
  shopifyLineIds: {},
  country: DEFAULT_COUNTRY,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);

        // Optimistic update - immediate UI feedback
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }

        // Sync with Shopify in background (non-blocking for INP)
        queueMicrotask(async () => {
          try {
            let { shopifyCartId, country } = get();
            if (!shopifyCartId) {
              const cartResult = await createCart(undefined, country);
              if (cartResult) {
                set({
                  shopifyCartId: cartResult.cartId,
                  shopifyCheckoutUrl: cartResult.checkoutUrl,
                  shopifyLineIds: cartResult.lineIds,
                });
                shopifyCartId = cartResult.cartId;
              }
            }
            if (!shopifyCartId) return;

            if (existing) {
              // Increment existing item — update quantity via line ID
              const lineId = get().shopifyLineIds[item.variantId];
              if (lineId) {
                await updateCartQuantity(
                  shopifyCartId,
                  lineId,
                  existing.quantity + 1,
                );
              }
            } else {
              // New item — add to cart and store the returned line ID
              const result = await addToCart(
                shopifyCartId,
                item.variantId,
                1,
              );
              if (result.lineId) {
                set((state) => ({
                  shopifyLineIds: {
                    ...state.shopifyLineIds,
                    [item.variantId]: result.lineId!,
                  },
                }));
              }
            }
          } catch (error) {
            console.error("Failed to sync with Shopify:", error);
          }
        });
      },

      removeItem: (id) => {
        const item = get().items.find((i) => i.id === id);

        // Optimistic local update — keep shopifyCartId intact
        set({ items: get().items.filter((i) => i.id !== id) });

        // Sync removal to Shopify
        if (item) {
          queueMicrotask(async () => {
            try {
              const { shopifyCartId, shopifyLineIds } = get();
              const lineId = shopifyLineIds[item.variantId];
              if (shopifyCartId && lineId) {
                await removeFromCart(shopifyCartId, lineId);
                // Clean up line ID mapping
                const { [item.variantId]: _, ...rest } = shopifyLineIds;
                set({ shopifyLineIds: rest });
              }
            } catch (error) {
              console.error("Failed to remove from Shopify cart:", error);
            }
          });
        }
      },

      removeAllItems: () =>
        set({
          items: [],
          shopifyLineIds: {},
        }),

      // Optimistic update + background Shopify sync
      updateQuantity: (id, quantity) => {
        const item = get().items.find((i) => i.id === id);
        const safeQty = Math.max(0, quantity);

        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: safeQty } : i
          ),
        });

        // Sync quantity change to Shopify
        if (item) {
          queueMicrotask(async () => {
            try {
              const { shopifyCartId, shopifyLineIds } = get();
              const lineId = shopifyLineIds[item.variantId];
              if (shopifyCartId && lineId) {
                await updateCartQuantity(shopifyCartId, lineId, safeQty);
              }
            } catch (error) {
              console.error("Failed to update Shopify cart quantity:", error);
            }
          });
        }
      },

      clearCart: () => set({ items: [], shopifyLineIds: {} }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + (i.price?.amount || 0) * i.quantity,
          0
        ),

      // Shopify cart management
      setShopifyCart: (
        cartId: string,
        checkoutUrl: string,
        lineIds?: Record<string, string>,
      ) =>
        set({
          shopifyCartId: cartId,
          shopifyCheckoutUrl: checkoutUrl,
          ...(lineIds && { shopifyLineIds: lineIds }),
        }),

      hydrateCart: async () => {
        const { shopifyCartId } = get();
        if (!shopifyCartId) return;

        // Verify the stored cart still exists in Shopify (carts expire after ~7 days)
        const cart = await getCart(shopifyCartId);

        if (!cart) {
          // Cart expired or invalid — clear stale state
          set({
            shopifyCartId: null,
            shopifyCheckoutUrl: null,
            shopifyLineIds: {},
          });
          return;
        }

        // Cart still valid — refresh checkout URL and line ID mappings
        set({
          shopifyCheckoutUrl: cart.checkoutUrl,
          shopifyLineIds: cart.lineIds,
        });
      },

      setCountry: (country: string) => {
        const prev = get().country;
        if (prev === country) return;

        // Invalidate Shopify cart — currency changed, need fresh cart
        set({
          country,
          shopifyCartId: null,
          shopifyCheckoutUrl: null,
          shopifyLineIds: {},
        });
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => {
        // Called after localStorage state is restored into the store.
        // Validate the stored Shopify cart ID — if it expired, clear stale state.
        return (state) => {
          if (state?.shopifyCartId) {
            state.hydrateCart();
          }
        };
      },
    }
  )
);
