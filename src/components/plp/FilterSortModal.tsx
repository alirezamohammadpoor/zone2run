"use client";

import dynamic from "next/dynamic";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import { FilterContent } from "./FilterContent";
import { SortContent } from "./SortContent";
import { CollapsibleFilterSection } from "./CollapsibleFilterSection";
import { Backdrop } from "@/components/ui/Backdrop";
import { ModalHeader } from "@/components/ui/ModalHeader";
import type { UrlFilters } from "@/hooks/useUrlFilters";
import type { SortOption } from "@/hooks/useUrlSort";

const FocusLock = dynamic(() => import("react-focus-lock"), { ssr: false });

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: UrlFilters;
  onFiltersChange: (filters: Partial<UrlFilters>) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableSizes: FilterOption[];
  availableBrands: FilterOption[];
  availableCategories: FilterOption[];
  activeFilterCount: number;
}

export function FilterSortModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  availableSizes,
  availableBrands,
  availableCategories,
  activeFilterCount,
}: FilterSortModalProps) {
  useModalScroll(isOpen);
  const { unlockScroll } = useModalScrollRestoration();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      unlockScroll();
    }, 300);
  };

  const handleClearAll = () => {
    onFiltersChange({
      size: [],
      brand: [],
      category: [],
      gender: [],
    });
    onSortChange("default");
  };

  return (
    <>
      <Backdrop isOpen={isOpen} onClick={handleClose} />
      <FocusLock disabled={!isOpen}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-sort-title"
          inert={!isOpen ? true : undefined}
          className={
            "fixed inset-0 bg-white z-50 transform transition-transform duration-300 flex flex-col xl:left-auto xl:right-0 xl:w-1/2 overscroll-contain" +
            (isOpen ? " translate-x-0" : " translate-x-full")
          }
        >
          <ModalHeader
            title="Filter & Sort"
            titleId="filter-sort-title"
            onClose={handleClose}
            bordered
          />

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {/* Active Selections Summary */}
            {(activeFilterCount > 0 || sort !== "default") && (
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {/* Sort pill */}
                  {sort !== "default" && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black text-white w-fit"
                      onClick={() => onSortChange("default")}
                    >
                      Sort: {sort === "newest" ? "Newest" : sort === "price-low" ? "Price ↑" : sort === "price-high" ? "Price ↓" : sort === "name-a" ? "A-Z" : "Z-A"}
                      <span className="text-gray-300" aria-hidden="true">×</span>
                    </button>
                  )}
                  {/* Size pills */}
                  {filters.size.map((size) => (
                    <button
                      key={`size-${size}`}
                      type="button"
                      className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black text-white w-fit"
                      onClick={() => onFiltersChange({ size: filters.size.filter((s) => s !== size) })}
                    >
                      {size}
                      <span className="text-gray-300" aria-hidden="true">×</span>
                    </button>
                  ))}
                  {/* Brand pills */}
                  {filters.brand.map((brand) => {
                    const brandOption = availableBrands.find((b) => b.value === brand);
                    return (
                      <button
                        key={`brand-${brand}`}
                        type="button"
                        className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black text-white w-fit"
                        onClick={() => onFiltersChange({ brand: filters.brand.filter((b) => b !== brand) })}
                      >
                        {brandOption?.label || brand}
                        <span className="text-gray-300" aria-hidden="true">×</span>
                      </button>
                    );
                  })}
                  {/* Category pills */}
                  {filters.category.map((category) => {
                    const categoryOption = availableCategories.find((c) => c.value === category);
                    return (
                      <button
                        key={`category-${category}`}
                        type="button"
                        className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-black text-white w-fit"
                        onClick={() => onFiltersChange({ category: filters.category.filter((c) => c !== category) })}
                      >
                        {categoryOption?.label || category}
                        <span className="text-gray-300" aria-hidden="true">×</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sort Section */}
            <CollapsibleFilterSection
              title="Sort"
              defaultOpen
            >
              <SortContent sort={sort} onSortChange={onSortChange} />
            </CollapsibleFilterSection>

            {/* Filter Sections */}
            <FilterContent
              filters={filters}
              onFiltersChange={onFiltersChange}
              availableSizes={availableSizes}
              availableBrands={availableBrands}
              availableCategories={availableCategories}
            />
          </div>

          {/* Footer with Clear & Apply */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4 flex gap-4">
            <button
              type="button"
              className="flex-1 py-3 text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
              onClick={handleClearAll}
              disabled={activeFilterCount === 0 && sort === "default"}
            >
              Clear All
            </button>
            <button
              type="button"
              className="flex-1 py-3 text-sm bg-black text-white hover:bg-gray-800 transition-colors"
              onClick={handleClose}
            >
              Apply
            </button>
          </div>
        </div>
      </FocusLock>
    </>
  );
}
