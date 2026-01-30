import type { CardProduct } from "@/types/cardProduct";

export interface RecentlyViewedState {
  products: CardProduct[];
}

export interface RecentlyViewedActions {
  addProduct: (product: CardProduct) => void;
  getLatest: (count: number) => CardProduct[];
  clearAll: () => void;
}

export type RecentlyViewedStore = RecentlyViewedState & RecentlyViewedActions;
