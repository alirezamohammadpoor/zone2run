"use client";

import { useState, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import ProductGridWithImages from "@/components/ProductGridWithImages";
import LoadMoreButton from "@/components/LoadMoreButton";
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
import type { EditorialImage } from "@/components/ProductGridWithImages";

const PRODUCTS_PER_LOAD = 28;

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
  /** Editorial images to interleave in the product grid */
  editorialImages?: EditorialImage[];
  /** Products between editorial images on mobile (default: 4) */
  productsPerImage?: number;
  /** Products between editorial images on XL (default: 8) */
  productsPerImageXL?: number;
  /** Grid layout variant (default: "4col") */
  gridLayout?: "4col" | "3col";
}

function ProductListingInner({
  products,
  breadcrumbs,
  initialFilters,
  editorialImages,
  productsPerImage,
  productsPerImageXL,
  gridLayout,
}: ProductListingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { lockScroll } = useModalScrollRestoration();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-based filter & sort state
  const { filters, updateFilters } = useUrlFilters(initialFilters);
  const { sort, updateSort } = useUrlSort();

  // Read visible limit from URL (?limit=56) — shareable & survives back/forward
  const urlLimit = searchParams.get("limit");
  const visibleCount = urlLimit ? Math.max(PRODUCTS_PER_LOAD, parseInt(urlLimit, 10) || PRODUCTS_PER_LOAD) : PRODUCTS_PER_LOAD;

  // Extract available filter options with cascading behavior
  const { availableSizes, availableBrands, availableCategories, availableGenders } =
    usePLPFilters(products, filters);

  // Apply filters & sort client-side
  const filteredProducts = useFilteredProducts(products, filters, sort);
  const activeFilterCount = countActiveFilters(filters);

  // Load More: show first N products, grow on click
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const remainingCount = Math.max(0, filteredProducts.length - visibleCount);

  const handleLoadMore = useCallback(() => {
    const newLimit = visibleCount + PRODUCTS_PER_LOAD;
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [visibleCount, searchParams, router, pathname]);

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

  // Choose grid component based on whether editorial images are provided
  const hasEditorialImages = editorialImages && editorialImages.length > 0;

  return (
    <>
      {/* Breadcrumbs Header */}
      {enhancedBreadcrumbs && <PLPBreadcrumbs segments={enhancedBreadcrumbs} />}

      {/* Filter Button + Product Count */}
      <FilterSortButton
        onClick={handleOpenModal}
        activeCount={activeFilterCount}
        totalCount={filteredProducts.length}
      />

      {/* Product Grid */}
      {hasEditorialImages ? (
        <ProductGridWithImages
          products={visibleProducts}
          editorialImages={editorialImages}
          productsPerImage={productsPerImage}
          productsPerImageXL={productsPerImageXL}
          gridLayout={gridLayout}
          hasMore={remainingCount > 0}
        />
      ) : (
        <ProductGrid
          products={visibleProducts}
          priorityCount={4}
        />
      )}

      {/* Load More */}
      <LoadMoreButton
        onLoadMore={handleLoadMore}
        remainingCount={remainingCount}
      />

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
        availableGenders={availableGenders}
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
