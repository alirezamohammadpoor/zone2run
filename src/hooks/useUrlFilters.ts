"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type UrlFilters = {
  category: string[];
  brand: string[];
  gender: string[];
  size: string[];
};

/**
 * @param initialFilters - Default filters to apply when no URL params exist.
 *   Used by specific category pages to pre-select the category filter
 *   while still showing sibling categories in the modal.
 */
export function useUrlFilters(initialFilters?: Partial<UrlFilters>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialFiltersRef = useRef(initialFilters);

  // Merge URL params with initial filters (URL takes precedence)
  const [filters, setFilters] = useState<UrlFilters>(() => {
    const urlCategory = searchParams?.getAll("category") || [];
    const urlBrand = searchParams?.getAll("brand") || [];
    const urlGender = searchParams?.getAll("gender") || [];
    const urlSize = searchParams?.getAll("size") || [];
    const init = initialFiltersRef.current;

    return {
      category: urlCategory.length > 0 ? urlCategory : (init?.category || []),
      brand: urlBrand.length > 0 ? urlBrand : (init?.brand || []),
      gender: urlGender.length > 0 ? urlGender : (init?.gender || []),
      size: urlSize.length > 0 ? urlSize : (init?.size || []),
    };
  });

  // When URL changes (e.g. back/forward nav), sync again
  // Falls back to initial filters when URL has no params for that key
  useEffect(() => {
    if (searchParams) {
      const urlCategory = searchParams.getAll("category");
      const urlBrand = searchParams.getAll("brand");
      const urlGender = searchParams.getAll("gender");
      const urlSize = searchParams.getAll("size");
      const init = initialFiltersRef.current;

      setFilters({
        category: urlCategory.length > 0 ? urlCategory : (init?.category || []),
        brand: urlBrand.length > 0 ? urlBrand : (init?.brand || []),
        gender: urlGender.length > 0 ? urlGender : (init?.gender || []),
        size: urlSize.length > 0 ? urlSize : (init?.size || []),
      });
    }
  }, [searchParams]);

  const updateFilters = (newFilters: Partial<UrlFilters>) => {
    if (!searchParams) return;

    const newSearchParams = new URLSearchParams(searchParams.toString());

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
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });

    // ✅ update UI immediately (fixes 1-step lag)
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return { filters, updateFilters };
}
