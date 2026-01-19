"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export default function PaginationNav({
  currentPage,
  totalPages,
  className,
}: PaginationNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  // Generate page numbers with ellipsis: [1] 2 3 ... 10
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Show ellipsis if current page is far from start
    if (currentPage > 3) {
      pages.push("...");
    }

    // Show pages around current
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className={`flex items-center justify-center gap-1 ${className || ""}`}
      aria-label="Pagination"
    >
      {/* Previous */}
      {currentPage > 1 && (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-3 py-2 text-xs hover:underline"
          aria-label="Previous page"
        >
          ←
        </Link>
      )}

      {/* Page numbers */}
      {getPageNumbers().map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`px-3 py-2 text-xs ${
              page === currentPage
                ? "underline font-medium"
                : "hover:underline"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-3 py-2 text-xs hover:underline"
          aria-label="Next page"
        >
          →
        </Link>
      )}
    </nav>
  );
}
