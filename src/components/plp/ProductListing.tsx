"use client";

import { useState, Suspense, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
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
import { loadMoreProducts, type PLPQueryType } from "@/lib/actions/loadMore";
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
  /** Total products matching this query (enables server-side pagination) */
  totalCount?: number;
  /** Query descriptor for server-side "Load More" */
  queryType?: PLPQueryType;
  /** Country code for locale-aware price enrichment in server action */
  country?: string;
}

function ProductListingInner({
  products: initialProducts,
  breadcrumbs,
  initialFilters,
  editorialImages,
  productsPerImage,
  productsPerImageXL,
  gridLayout,
  totalCount,
  queryType,
  country,
}: ProductListingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { lockScroll } = useModalScrollRestoration();
  const [isPending, startTransition] = useTransition();

  // Server-side pagination state: accumulate loaded products
  const [allProducts, setAllProducts] = useState(initialProducts);

  // Whether server-side pagination is enabled
  const hasServerPagination = queryType != null && totalCount != null;

  // URL-based filter & sort state
  const { filters, updateFilters } = useUrlFilters(initialFilters);
  const { sort, updateSort } = useUrlSort();

  // Extract available filter options with cascading behavior
  const { availableSizes, availableBrands, availableCategories, availableGenders } =
    usePLPFilters(allProducts, filters);

  // Apply filters & sort client-side
  const filteredProducts = useFilteredProducts(allProducts, filters, sort);
  const activeFilterCount = countActiveFilters(filters);

  // Client-side visible slice for non-server-paginated mode
  const visibleProducts = hasServerPagination
    ? filteredProducts
    : filteredProducts.slice(0, PRODUCTS_PER_LOAD + (allProducts.length - initialProducts.length));

  // Remaining: server-side = totalCount - loaded; client-side = filtered - visible
  const remainingCount = hasServerPagination
    ? Math.max(0, totalCount - allProducts.length)
    : Math.max(0, filteredProducts.length - visibleProducts.length);

  const handleLoadMore = useCallback(() => {
    if (hasServerPagination) {
      // Server-side: fetch next batch via server action
      startTransition(async () => {
        const newProducts = await loadMoreProducts(
          queryType,
          allProducts.length,
          country,
        );
        if (newProducts.length > 0) {
          setAllProducts((prev) => [...prev, ...newProducts]);
        }
      });
    }
  }, [hasServerPagination, queryType, allProducts.length, country]);

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

  // Display count: use server totalCount if available, otherwise filtered count
  const displayTotalCount = hasServerPagination ? totalCount : filteredProducts.length;

  return (
    <>
      {/* Breadcrumbs Header */}
      {enhancedBreadcrumbs && <PLPBreadcrumbs segments={enhancedBreadcrumbs} />}

      {/* Filter Button + Product Count */}
      <FilterSortButton
        onClick={handleOpenModal}
        activeCount={activeFilterCount}
        totalCount={displayTotalCount}
      />

      {/* Product Grid */}
      {hasEditorialImages ? (
        <ProductGridWithImages
          products={hasServerPagination ? filteredProducts : visibleProducts}
          editorialImages={editorialImages}
          productsPerImage={productsPerImage}
          productsPerImageXL={productsPerImageXL}
          gridLayout={gridLayout}
          hasMore={remainingCount > 0}
        />
      ) : (
        <ProductGrid
          products={hasServerPagination ? filteredProducts : visibleProducts}
          priorityCount={4}
        />
      )}

      {/* Load More */}
      <LoadMoreButton
        onLoadMore={handleLoadMore}
        remainingCount={remainingCount}
        isLoading={isPending}
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
 * When totalCount + queryType are provided, uses server-side pagination.
 * Wraps inner component in Suspense for useSearchParams compatibility.
 */
export function ProductListing(props: ProductListingProps) {
  return (
    <Suspense fallback={<ProductGrid products={props.products} />}>
      <ProductListingInner {...props} />
    </Suspense>
  );
}
