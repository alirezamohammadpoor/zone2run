import { create } from "zustand";

interface ScrollStore {
  scrollY: number;
  setScrollY: (y: number) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  scrollY: 0,
  setScrollY: (y) => set({ scrollY: y }),
}));
