"use client";

import type { UrlFilters } from "@/hooks/useUrlFilters";
import { CollapsibleFilterSection } from "./CollapsibleFilterSection";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterContentProps {
  filters: UrlFilters;
  onFiltersChange: (filters: Partial<UrlFilters>) => void;
  availableSizes: FilterOption[];
  availableBrands: FilterOption[];
  availableCategories: FilterOption[];
}

function FilterPill({
  option,
  isSelected,
  onToggle,
}: {
  option: FilterOption;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 px-2 py-1 text-xs transition-colors w-fit ${
        isSelected ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
      }`}
      onClick={onToggle}
      aria-pressed={isSelected}
    >
      {option.label}
      {option.count !== undefined && (
        <span className={isSelected ? "text-gray-300" : "text-gray-500"}>
          ({option.count})
        </span>
      )}
      {isSelected && (
        <span className="text-gray-300" aria-hidden="true">
          ×
        </span>
      )}
    </button>
  );
}

export function FilterContent({
  filters,
  onFiltersChange,
  availableSizes,
  availableBrands,
  availableCategories,
}: FilterContentProps) {
  const toggleFilter = (key: keyof UrlFilters, value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ [key]: updated });
  };

  return (
    <div>
      {/* Size Filter */}
      {availableSizes.length > 0 && (
        <CollapsibleFilterSection
          title="Size"
          defaultOpen
          count={filters.size.length}
        >
          <div className="flex flex-col gap-1">
            {availableSizes.map((option) => (
              <FilterPill
                key={option.value}
                option={option}
                isSelected={filters.size.includes(option.value)}
                onToggle={() => toggleFilter("size", option.value)}
              />
            ))}
          </div>
        </CollapsibleFilterSection>
      )}

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <CollapsibleFilterSection
          title="Brand"
          defaultOpen={false}
          count={filters.brand.length}
        >
          <div className="flex flex-col gap-1">
            {availableBrands.map((option) => (
              <FilterPill
                key={option.value}
                option={option}
                isSelected={filters.brand.includes(option.value)}
                onToggle={() => toggleFilter("brand", option.value)}
              />
            ))}
          </div>
        </CollapsibleFilterSection>
      )}

      {/* Category Filter */}
      {availableCategories.length > 0 && (
        <CollapsibleFilterSection
          title="Category"
          defaultOpen={false}
          count={filters.category.length}
        >
          <div className="flex flex-col gap-1">
            {availableCategories.map((option) => (
              <FilterPill
                key={option.value}
                option={option}
                isSelected={filters.category.includes(option.value)}
                onToggle={() => toggleFilter("category", option.value)}
              />
            ))}
          </div>
        </CollapsibleFilterSection>
      )}
    </div>
  );
}
