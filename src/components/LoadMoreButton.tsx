"use client";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  remainingCount: number;
  className?: string;
  isLoading?: boolean;
}

export default function LoadMoreButton({
  onLoadMore,
  remainingCount,
  className = "my-8 md:my-12",
  isLoading = false,
}: LoadMoreButtonProps) {
  if (remainingCount <= 0 && !isLoading) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="text-xs hover:underline disabled:opacity-50 disabled:no-underline"
      >
        {isLoading ? "Loading..." : `Load More (${remainingCount})`}
      </button>
    </div>
  );
}
