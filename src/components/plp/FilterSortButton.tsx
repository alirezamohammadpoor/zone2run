"use client";

interface FilterSortButtonProps {
  onClick: () => void;
  activeCount: number;
  productCount: number;
}

export function FilterSortButton({
  onClick,
  activeCount,
  productCount,
}: FilterSortButtonProps) {
  return (
    <div className="flex items-center justify-between px-2 mb-4">
      <button
        type="button"
        className="text-xs hover:text-gray-500"
        onClick={onClick}
        aria-label={`Open filters${activeCount > 0 ? `, ${activeCount} active` : ""}`}
      >
        Filter{activeCount > 0 && ` (${activeCount})`}
      </button>
      <span className="text-xs text-gray-500">
        {productCount} product{productCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
