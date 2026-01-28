"use client";

interface FilterSortButtonProps {
  onClick: () => void;
  activeCount: number;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Number of products shown on current page */
  displayedCount: number;
  /** Total number of filtered products */
  totalCount: number;
  /** Products per page */
  pageSize: number;
}

export function FilterSortButton({
  onClick,
  activeCount,
  currentPage,
  displayedCount,
  totalCount,
  pageSize,
}: FilterSortButtonProps) {
  // Calculate range: "1-16 of 36" on page 1, "17-32 of 36" on page 2, etc.
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = startIndex + displayedCount - 1;
  const showPaginated = totalCount > pageSize;

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
        {showPaginated
          ? `${startIndex}-${endIndex} of ${totalCount} products`
          : `${totalCount} product${totalCount !== 1 ? "s" : ""}`}
      </span>
    </div>
  );
}
