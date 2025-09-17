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
  isAdded: {},
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
          console.log("🛒 Cart result from createCart:", cartResult);
          if (cartResult) {
            console.log("🛒 Setting cart ID:", cartResult.cartId);
            console.log("🛒 Setting checkout URL:", cartResult.checkoutUrl);
            set({
              shopifyCartId: cartResult.cartId,
              shopifyCheckoutUrl: cartResult.checkoutUrl,
            });
          }
        }

        // Add item to Shopify cart
        const updatedState = get();
        if (updatedState.shopifyCartId) {
          console.log("🛒 Adding item to Shopify cart:", {
            cartId: updatedState.shopifyCartId,
            variantId: item.variantId,
            item: item,
            existingInLocalCart: !!existing,
          });

          // Only try to add to Shopify if it's a new item
          // For existing items, we'll rely on the local cart for now
          // In a production app, you'd want to sync with Shopify cart properly
          if (!existing) {
            const success = await addToCart(
              updatedState.shopifyCartId,
              item.variantId,
              1
            );
            if (!success) {
              console.error("🛒 Failed to add item to Shopify cart");
              // The item was added to local cart but failed to sync with Shopify
              // This could happen if the item is out of stock or has quantity limits
            }
          } else {
            console.log(
              "🛒 Item already exists in local cart, skipping Shopify add"
            );
          }
        }
      },

      removeItem: (id) =>
        set({
          items: get().items.filter((i) => i.id !== id),
          shopifyCartId: null,
          shopifyCheckoutUrl: null,
        }),

      removeAllItems: () =>
        set({
          items: [],
          shopifyCartId: null,
          shopifyCheckoutUrl: null,
        }),

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

      setIsAdded: (variantId: string, isAdded: boolean) => {
        set((state) => ({
          isAdded: { ...state.isAdded, [variantId]: isAdded },
        }));
      },

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
