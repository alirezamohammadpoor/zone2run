"use client";

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  remainingCount: number;
  className?: string;
}

export default function LoadMoreButton({
  onLoadMore,
  remainingCount,
  className = "my-8 md:my-12",
}: LoadMoreButtonProps) {
  if (remainingCount <= 0) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        type="button"
        onClick={onLoadMore}
        className="text-xs hover:underline min-h-touch-target px-4 flex items-center"
      >
        Load More ({remainingCount})
      </button>
    </div>
  );
}
