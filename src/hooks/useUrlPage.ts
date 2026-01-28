"use client";

import { useSearchParams } from "next/navigation";

/**
 * Hook to read the current page number from URL search params.
 * Page param is managed by PaginationNav component which handles navigation.
 *
 * @returns Current page number (defaults to 1 if not in URL)
 */
export function useUrlPage(): number {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  return pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
}
