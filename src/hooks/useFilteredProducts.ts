"use client";

import { useMemo } from "react";
import type { PLPProduct } from "@/types/plpProduct";
import type { UrlFilters } from "@/hooks/useUrlFilters";
import type { SortOption } from "@/hooks/useUrlSort";

/**
 * Filters and sorts products based on URL params.
 * Uses useMemo for efficient re-computation only when deps change.
 */
export function useFilteredProducts(
  products: PLPProduct[],
  filters: UrlFilters,
  sort: SortOption
): PLPProduct[] {
  return useMemo(() => {
    let filtered = products;

    // Filter by size (product matches if it has the size in its sizes array)
    if (filters.size.length > 0) {
      filtered = filtered.filter((product) =>
        product.sizes.some((size) => filters.size.includes(size))
      );
    }

    // Filter by brand
    if (filters.brand.length > 0) {
      filtered = filtered.filter((product) =>
        filters.brand.includes(product.brand.slug)
      );
    }

    // Filter by category
    if (filters.category.length > 0) {
      filtered = filtered.filter((product) =>
        filters.category.includes(product.category.slug)
      );
    }

    // Filter by gender (always include unisex — mirrors GROQ server-side logic)
    if (filters.gender.length > 0) {
      filtered = filtered.filter(
        (product) =>
          product.gender &&
          (filters.gender.includes(product.gender) || product.gender === "unisex")
      );
    }

    // Sort
    if (sort === "newest") {
      filtered = [...filtered].sort((a, b) => {
        const aDate = a._createdAt ? new Date(a._createdAt).getTime() : 0;
        const bDate = b._createdAt ? new Date(b._createdAt).getTime() : 0;
        return bDate - aDate;
      });
    } else if (sort === "price-low") {
      filtered = [...filtered].sort(
        (a, b) =>
          (a.priceRange?.minVariantPrice || 0) -
          (b.priceRange?.minVariantPrice || 0)
      );
    } else if (sort === "price-high") {
      filtered = [...filtered].sort(
        (a, b) =>
          (b.priceRange?.minVariantPrice || 0) -
          (a.priceRange?.minVariantPrice || 0)
      );
    } else if (sort === "name-a") {
      filtered = [...filtered].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    } else if (sort === "name-z") {
      filtered = [...filtered].sort((a, b) =>
        (b.title || "").localeCompare(a.title || "")
      );
    }

    return filtered;
  }, [products, filters, sort]);
}

/**
 * Count active filters (excluding sort)
 */
export function countActiveFilters(filters: UrlFilters): number {
  return (
    filters.size.length +
    filters.brand.length +
    filters.category.length +
    filters.gender.length
  );
}
