import type { ShopifyProduct } from "@/types/shopify";

export interface CartItem {
  id: string;
  title: string;
  price: ShopifyProduct["priceRange"]["minVariantPrice"];
  quantity: number;
  image?: string;
  variantId: string;
  productHandle: string;
  color: string;
  size: string;
  brand?: string; // Optional since it may not be available from Shopify
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  shopifyCartId: string | null;
  shopifyCheckoutUrl: string | null;
  /** Maps variantId → Shopify cart line ID (needed for update/remove operations) */
  shopifyLineIds: { [variantId: string]: string };
  /** Current country code for multi-currency cart */
  country: string;
}

export interface CartActions {
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  removeAllItems: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  // Shopify cart management
  setShopifyCart: (cartId: string, checkoutUrl: string, lineIds?: Record<string, string>) => void;
  syncWithShopify: () => Promise<void>;
  /** Update country — invalidates Shopify cart if currency changed */
  setCountry: (country: string) => void;
}

export type CartStore = CartState & CartActions;
