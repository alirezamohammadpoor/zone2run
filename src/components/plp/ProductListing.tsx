"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import ProductGrid from "@/components/ProductGrid";
import { FilterSortButton } from "./FilterSortButton";
import { PLPBreadcrumbs } from "@/components/product/Breadcrumbs";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useUrlSort } from "@/hooks/useUrlSort";
import { usePLPFilters } from "@/hooks/usePLPFilters";
import {
  useFilteredProducts,
  countActiveFilters,
} from "@/hooks/useFilteredProducts";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import type { PLPProduct } from "@/types/plpProduct";
import type { BreadcrumbItem } from "@/lib/utils/breadcrumbs";

// Lazy load the modal for better initial bundle
const FilterSortModal = dynamic(
  () =>
    import("./FilterSortModal").then((mod) => ({
      default: mod.FilterSortModal,
    })),
  { ssr: false }
);

interface ProductListingProps {
  products: PLPProduct[];
  /** Breadcrumb segments for header */
  breadcrumbs?: BreadcrumbItem[];
  /** Pre-applied filters (e.g., for specific category pages) */
  initialFilters?: {
    category?: string[];
    brand?: string[];
    size?: string[];
    gender?: string[];
  };
}

function ProductListingInner({
  products,
  breadcrumbs,
  initialFilters,
}: ProductListingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { lockScroll } = useModalScrollRestoration();

  // URL-based filter & sort state
  const { filters, updateFilters } = useUrlFilters(initialFilters);
  const { sort, updateSort } = useUrlSort();

  // Extract available filter options with cascading behavior
  const { availableSizes, availableBrands, availableCategories } =
    usePLPFilters(products, filters);

  // Apply filters & sort client-side
  const filteredProducts = useFilteredProducts(products, filters, sort);
  const activeFilterCount = countActiveFilters(filters);

  const handleOpenModal = () => {
    lockScroll();
    setIsModalOpen(true);
  };

  // Build enhanced breadcrumbs when a category filter is active
  const enhancedBreadcrumbs = (() => {
    if (!breadcrumbs) return undefined;

    // If exactly one category is selected and it's not already in breadcrumbs
    if (filters.category.length === 1) {
      const selectedCategorySlug = filters.category[0];
      const selectedCategory = availableCategories.find(
        (c) => c.value === selectedCategorySlug
      );

      if (selectedCategory) {
        const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
        // Don't duplicate if breadcrumbs already end with this category
        if (!lastBreadcrumb?.href.endsWith(`/${selectedCategorySlug}`)) {
          return [
            ...breadcrumbs,
            {
              label: selectedCategory.label,
              href: `${lastBreadcrumb.href}/${selectedCategorySlug}`,
            },
          ];
        }
      }
    }

    return breadcrumbs;
  })();

  return (
    <>
      {/* Breadcrumbs Header */}
      {enhancedBreadcrumbs && <PLPBreadcrumbs segments={enhancedBreadcrumbs} />}

      {/* Filter Button + Product Count */}
      <FilterSortButton
        onClick={handleOpenModal}
        activeCount={activeFilterCount}
        productCount={filteredProducts.length}
      />

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} />

      {/* Filter/Sort Modal */}
      <FilterSortModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        onFiltersChange={updateFilters}
        sort={sort}
        onSortChange={updateSort}
        availableSizes={availableSizes}
        availableBrands={availableBrands}
        availableCategories={availableCategories}
        activeFilterCount={activeFilterCount}
      />
    </>
  );
}

/**
 * Main PLP component with client-side filtering and sorting.
 * Wraps inner component in Suspense for useSearchParams compatibility.
 */
export function ProductListing(props: ProductListingProps) {
  return (
    <Suspense fallback={<ProductGrid products={props.products} />}>
      <ProductListingInner {...props} />
    </Suspense>
  );
}
