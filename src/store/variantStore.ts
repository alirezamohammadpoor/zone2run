import { create } from "zustand";

export type Variant = {
  id: string;
  size: string;
  available: boolean;
  title: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  sku?: string;
  color?: string;
};

type ProductState = {
  selectedVariant: Variant | null;
  setSelectedVariant: (variant: Variant) => void;
};

export const useProductStore = create<ProductState>((set) => ({
  selectedVariant: null,
  setSelectedVariant: (variant) => set({ selectedVariant: variant }),
}));
