"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useClientSearch, notifyUrlChange } from "./useClientSearch";

export type UrlFilters = {
  category: string[];
  brand: string[];
  gender: string[];
  size: string[];
};

function filtersFromSearch(
  search: string,
  init?: Partial<UrlFilters>,
): UrlFilters {
  const params = new URLSearchParams(search);
  const urlCategory = params.getAll("category");
  const urlBrand = params.getAll("brand");
  const urlGender = params.getAll("gender");
  const urlSize = params.getAll("size");

  return {
    category: urlCategory.length > 0 ? urlCategory : (init?.category || []),
    brand: urlBrand.length > 0 ? urlBrand : (init?.brand || []),
    gender: urlGender.length > 0 ? urlGender : (init?.gender || []),
    size: urlSize.length > 0 ? urlSize : (init?.size || []),
  };
}

/**
 * @param initialFilters - Default filters to apply when no URL params exist.
 *   Used by specific category pages to pre-select the category filter
 *   while still showing sibling categories in the modal.
 */
export function useUrlFilters(initialFilters?: Partial<UrlFilters>) {
  // useClientSearch instead of useSearchParams — the latter suspends during
  // prerender under Cache Components and forces the PLP grid into a fallback
  const search = useClientSearch();
  const router = useRouter();
  const initialFiltersRef = useRef(initialFilters);

  const [filters, setFilters] = useState<UrlFilters>(() =>
    filtersFromSearch(search, initialFiltersRef.current),
  );

  // When URL changes (mount with deep-linked params, back/forward nav), sync.
  // Falls back to initial filters when URL has no params for that key
  useEffect(() => {
    setFilters(filtersFromSearch(search, initialFiltersRef.current));
  }, [search]);

  const updateFilters = (newFilters: Partial<UrlFilters>) => {
    // Event-time read — render-time URL hooks would suspend under Cache Components
    const newSearchParams = new URLSearchParams(window.location.search);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (!value || value.length === 0) {
        newSearchParams.delete(key);
      } else {
        if (Array.isArray(value)) {
          newSearchParams.delete(key);
          value.forEach((v) => newSearchParams.append(key, v));
        } else {
          newSearchParams.set(key, value);
        }
      }
    });

    // Reset limit when filters change (back to first page of results)
    newSearchParams.delete("limit");

    // ✅ update URL
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    });
    notifyUrlChange();

    // ✅ update UI immediately (fixes 1-step lag)
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return { filters, updateFilters };
}
