"use client";

import type { SortOption } from "@/hooks/useUrlSort";

interface SortContentProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price-low", label: "Price: Low to High" },
  { key: "price-high", label: "Price: High to Low" },
  { key: "name-a", label: "Name: A to Z" },
  { key: "name-z", label: "Name: Z to A" },
];

export function SortContent({ sort, onSortChange }: SortContentProps) {
  return (
    <div className="flex flex-col gap-1">
      {SORT_OPTIONS.map((option) => {
        const isSelected = sort === option.key;
        return (
          <button
            key={option.key}
            type="button"
            className={`inline-flex items-center gap-2 px-2 py-1 text-xs transition-colors w-fit ${
              isSelected
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => onSortChange(option.key)}
            aria-pressed={isSelected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
