import { create } from "zustand";
import type { Product } from "@/types/product";

interface SearchFilters {
  category: string[];
  brand: string[];
  gender: string[];
  priceRange: [number, number];
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  results: Product[];
  isLoading: boolean;
  isSearchOpen: boolean;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setResults: (results: Product[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  clearSearch: () => void;
  clearFilters: () => void;
}

type SearchStore = SearchState & SearchActions;

const initialState: SearchState = {
  query: "",
  filters: {
    category: [],
    brand: [],
    gender: [],
    priceRange: [0, 3000],
  },
  results: [],
  isLoading: false,
  isSearchOpen: false,
};

export const useSearchStore = create<SearchStore>((set, get) => ({
  ...initialState,
  setQuery: (query) => {
    set({ query });
  },

  setResults: (results) => {
    set({ results });
    console.log("Zustand search store results:", results);
  },

  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },

  setIsSearchOpen: (isOpen) => {
    set({ isSearchOpen: isOpen });
  },

  setFilters: (newFilters) => {
    const { filters } = get();
    set({
      filters: { ...filters, ...newFilters },
    });
  },

  clearSearch: () => {
    set({
      query: "",
      results: [],
      isLoading: false,
    });
  },

  clearFilters: () => {
    set({
      filters: {
        category: [],
        brand: [],
        gender: [],
        priceRange: [0, 1000],
      },
    });
  },
}));
