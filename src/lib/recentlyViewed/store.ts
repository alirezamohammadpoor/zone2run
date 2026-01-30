"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RecentlyViewedStore,
  RecentlyViewedState,
} from "./types";

const MAX_PRODUCTS = 10;

const initialState: RecentlyViewedState = {
  products: [],
};

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addProduct: (product) => {
        const current = get().products;

        // Remove if already exists (will be re-added at front)
        const filtered = current.filter((p) => p.handle !== product.handle);

        // Prepend new product, limit to max
        const updated = [product, ...filtered].slice(0, MAX_PRODUCTS);

        set({ products: updated });
      },
    }),
    { name: "recently-viewed-storage" }
  )
);
