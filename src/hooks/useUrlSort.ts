"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "name-a"
  | "name-z";

const VALID_SORT_OPTIONS: SortOption[] = [
  "newest",
  "price-low",
  "price-high",
  "name-a",
  "name-z",
];

export function useUrlSort() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sortParam = searchParams?.get("sort") || "";
  const sort: SortOption =
    sortParam && VALID_SORT_OPTIONS.includes(sortParam as SortOption)
      ? (sortParam as SortOption)
      : "newest";

  const updateSort = (newSort: SortOption) => {
    if (newSort === sort || !searchParams) {
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (newSort === "newest") {
      // Remove sort param for default (cleaner URLs)
      newSearchParams.delete("sort");
    } else {
      newSearchParams.set("sort", newSort);
    }
    // Reset limit when sort changes (back to first page of results)
    newSearchParams.delete("limit");
    const queryString = newSearchParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return { sort, updateSort };
}
