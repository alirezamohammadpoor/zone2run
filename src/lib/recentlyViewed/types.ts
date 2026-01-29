export interface RecentlyViewedProduct {
  _id: string;
  handle: string;
  title: string;
  images: Array<{
    url: string;
    alt?: string;
  }>;
  priceRange: {
    minVariantPrice: number;
  };
  brand?: {
    name: string;
    slug?: string;
  };
  vendor?: string;
}

export interface RecentlyViewedState {
  products: RecentlyViewedProduct[];
}

export interface RecentlyViewedActions {
  addProduct: (product: RecentlyViewedProduct) => void;
  getLatest: (count: number) => RecentlyViewedProduct[];
  clearAll: () => void;
}

export type RecentlyViewedStore = RecentlyViewedState & RecentlyViewedActions;
