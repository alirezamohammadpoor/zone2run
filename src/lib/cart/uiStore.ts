import { create } from "zustand";

interface UIState {
  showAddedToCartModal: boolean;
  lastAddedProduct: {
    title: string;
    image: string;
    size: string;
    color: string;
    price: number;
    brand: string;
    currencyCode: string;
  } | null;
}

interface UIActions {
  setShowAddedToCartModal: (show: boolean) => void;
  setLastAddedProduct: (product: UIState["lastAddedProduct"]) => void;
  showAddedToCart: (product: {
    title: string;
    image: string;
    size: string;
    color: string;
    price: number;
    brand: string;
    currencyCode: string;
  }) => void;
  hideAddedToCart: () => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  // State
  showAddedToCartModal: false,
  lastAddedProduct: null,

  // Actions
  setShowAddedToCartModal: (show) => set({ showAddedToCartModal: show }),

  setLastAddedProduct: (product) => set({ lastAddedProduct: product }),

  showAddedToCart: (product) =>
    set({
      showAddedToCartModal: true,
      lastAddedProduct: product,
    }),

  hideAddedToCart: () =>
    set({
      showAddedToCartModal: false,
      // Don't clear lastAddedProduct immediately - let animation finish
    }),
}));
