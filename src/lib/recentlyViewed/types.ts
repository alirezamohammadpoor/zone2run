import type { CardProduct } from "@/types/cardProduct";

export interface RecentlyViewedState {
  products: CardProduct[];
}

export interface RecentlyViewedActions {
  addProduct: (product: CardProduct) => void;
}

export type RecentlyViewedStore = RecentlyViewedState & RecentlyViewedActions;
