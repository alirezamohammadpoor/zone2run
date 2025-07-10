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
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  shopifyCartId: string | null;
  shopifyCheckoutUrl: string | null;
}

export interface CartActions {
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  // Shopify cart management
  setShopifyCart: (cartId: string, checkoutUrl: string) => void;
  syncWithShopify: () => Promise<void>;
}

export type CartStore = CartState & CartActions;
