"use client";

import { useMemo } from "react";
import type { PLPProduct } from "@/types/plpProduct";
import type { UrlFilters } from "@/hooks/useUrlFilters";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface PLPFilters {
  availableSizes: FilterOption[];
  availableBrands: FilterOption[];
  availableCategories: FilterOption[];
  availableGenders: FilterOption[];
}

/**
 * Standard size ordering for display.
 * Letter sizes first (XXS → XXXL), then numeric, then alphabetic.
 */
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const GENDER_LABELS: Record<string, string> = {
  mens: "Men",
  womens: "Women",
  unisex: "Unisex",
};

function sortSizes(sizes: FilterOption[]): FilterOption[] {
  return sizes.sort((a, b) => {
    const aUpper = a.value.toUpperCase();
    const bUpper = b.value.toUpperCase();
    const aIndex = SIZE_ORDER.indexOf(aUpper);
    const bIndex = SIZE_ORDER.indexOf(bUpper);

    // Both are standard letter sizes
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // Only a is standard → a comes first
    if (aIndex !== -1) return -1;

    // Only b is standard → b comes first
    if (bIndex !== -1) return 1;

    // Both numeric?
    const aNum = parseFloat(a.value);
    const bNum = parseFloat(b.value);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }

    // Fallback: alphabetic
    return a.value.localeCompare(b.value);
  });
}

/**
 * Filters products by specified criteria (used for cascading).
 */
function filterProducts(
  products: PLPProduct[],
  filters: { sizes?: string[]; brands?: string[]; categories?: string[]; genders?: string[] }
): PLPProduct[] {
  let filtered = products;

  if (filters.sizes && filters.sizes.length > 0) {
    filtered = filtered.filter((p) =>
      p.sizes.some((s) => filters.sizes!.includes(s))
    );
  }

  if (filters.brands && filters.brands.length > 0) {
    filtered = filtered.filter((p) => filters.brands!.includes(p.brand.slug));
  }

  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter((p) =>
      filters.categories!.includes(p.category.slug)
    );
  }

  if (filters.genders && filters.genders.length > 0) {
    filtered = filtered.filter(
      (p) => p.gender && filters.genders!.includes(p.gender)
    );
  }

  return filtered;
}

/**
 * Counts sizes from a list of products.
 */
function countSizes(products: PLPProduct[]): FilterOption[] {
  const sizeMap = new Map<string, number>();

  for (const product of products) {
    for (const size of product.sizes) {
      sizeMap.set(size, (sizeMap.get(size) || 0) + 1);
    }
  }

  return sortSizes(
    Array.from(sizeMap.entries()).map(([value, count]) => ({
      value,
      label: value,
      count,
    }))
  );
}

/**
 * Counts brands from a list of products.
 */
function countBrands(products: PLPProduct[]): FilterOption[] {
  const brandMap = new Map<string, { name: string; count: number }>();

  for (const product of products) {
    if (product.brand?.slug) {
      const existing = brandMap.get(product.brand.slug);
      if (existing) {
        existing.count++;
      } else {
        brandMap.set(product.brand.slug, {
          name: product.brand.name,
          count: 1,
        });
      }
    }
  }

  return Array.from(brandMap.entries())
    .map(([slug, { name, count }]) => ({
      value: slug,
      label: name,
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Counts categories from a list of products.
 */
function countCategories(products: PLPProduct[]): FilterOption[] {
  const categoryMap = new Map<string, { title: string; count: number }>();

  for (const product of products) {
    if (product.category?.slug) {
      const existing = categoryMap.get(product.category.slug);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(product.category.slug, {
          title: product.category.title,
          count: 1,
        });
      }
    }
  }

  return Array.from(categoryMap.entries())
    .map(([slug, { title, count }]) => ({
      value: slug,
      label: title,
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Counts genders from a list of products.
 */
function countGenders(products: PLPProduct[]): FilterOption[] {
  const genderMap = new Map<string, number>();

  for (const product of products) {
    if (product.gender) {
      genderMap.set(product.gender, (genderMap.get(product.gender) || 0) + 1);
    }
  }

  return Array.from(genderMap.entries())
    .map(([value, count]) => ({
      value,
      label: GENDER_LABELS[value] || value,
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Extracts available filter options with cascading behavior.
 *
 * Each filter type shows options based on products that match
 * the OTHER active filters. This way:
 * - Size options update when brand/category/gender changes
 * - Brand options update when size/category/gender changes
 * - Category options update when size/brand/gender changes
 * - Gender options update when size/brand/category changes
 *
 * @param products - All products for this page
 * @param filters - Currently active filters from URL
 */
export function usePLPFilters(
  products: PLPProduct[],
  filters: UrlFilters
): PLPFilters {
  return useMemo(() => {
    // For sizes: filter by brand + category + gender (not size)
    const productsForSizes = filterProducts(products, {
      brands: filters.brand,
      categories: filters.category,
      genders: filters.gender,
    });

    // For brands: filter by size + category + gender (not brand)
    const productsForBrands = filterProducts(products, {
      sizes: filters.size,
      categories: filters.category,
      genders: filters.gender,
    });

    // For categories: filter by size + brand + gender (not category)
    const productsForCategories = filterProducts(products, {
      sizes: filters.size,
      brands: filters.brand,
      genders: filters.gender,
    });

    // For genders: filter by size + brand + category (not gender)
    const productsForGenders = filterProducts(products, {
      sizes: filters.size,
      brands: filters.brand,
      categories: filters.category,
    });

    return {
      availableSizes: countSizes(productsForSizes),
      availableBrands: countBrands(productsForBrands),
      availableCategories: countCategories(productsForCategories),
      availableGenders: countGenders(productsForGenders),
    };
  }, [products, filters]);
}
