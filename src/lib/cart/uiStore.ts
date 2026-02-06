import { create } from "zustand";

interface CountrySwitchData {
  newCountry: string;
  newCurrency: string;
  prevCountry: string;
}

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
  showCountrySwitchToast: boolean;
  countrySwitchData: CountrySwitchData | null;
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
  showCountrySwitch: (data: CountrySwitchData) => void;
  hideCountrySwitch: () => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  // State
  showAddedToCartModal: false,
  lastAddedProduct: null,
  showCountrySwitchToast: false,
  countrySwitchData: null,

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

  showCountrySwitch: (data) =>
    set({ showCountrySwitchToast: true, countrySwitchData: data }),

  hideCountrySwitch: () =>
    set({ showCountrySwitchToast: false }),
}));
