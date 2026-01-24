"use client";

import { useState, useCallback } from "react";

/**
 * Hook for managing a Set of toggled items (accordion states, open sections, etc.)
 * Replaces the repeated toggle pattern found in menu components.
 */
export function useSetToggle<T>(initialValue: Set<T> = new Set()) {
  const [items, setItems] = useState<Set<T>>(initialValue);

  const toggle = useCallback((item: T) => {
    setItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  }, []);

  const has = useCallback((item: T) => items.has(item), [items]);

  const add = useCallback((item: T) => {
    setItems((prev) => new Set(prev).add(item));
  }, []);

  const remove = useCallback((item: T) => {
    setItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(item);
      return newSet;
    });
  }, []);

  const clear = useCallback(() => {
    setItems(new Set());
  }, []);

  return { items, toggle, has, add, remove, clear };
}
