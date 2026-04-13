"use client";

import { create } from "zustand";

interface ScrollStore {
  scrollY: number;
  setScrollY: (y: number) => void;
  /** Pathname captured at lock time. Null when nothing is locked. */
  lockedPathname: string | null;
  setLockedPathname: (p: string | null) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  scrollY: 0,
  setScrollY: (y) => set({ scrollY: y }),
  lockedPathname: null,
  setLockedPathname: (p) => set({ lockedPathname: p }),
}));
