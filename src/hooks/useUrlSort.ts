"use client";

import { useRouter } from "next/navigation";
import { useClientSearch, notifyUrlChange } from "./useClientSearch";

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
  const search = useClientSearch();
  const router = useRouter();
  const sortParam = new URLSearchParams(search).get("sort") || "";
  const sort: SortOption =
    sortParam && VALID_SORT_OPTIONS.includes(sortParam as SortOption)
      ? (sortParam as SortOption)
      : "newest";

  const updateSort = (newSort: SortOption) => {
    if (newSort === sort) {
      return;
    }
    // Event-time reads — render-time URL hooks would suspend under Cache Components
    const newSearchParams = new URLSearchParams(window.location.search);
    if (newSort === "newest") {
      // Remove sort param for default (cleaner URLs)
      newSearchParams.delete("sort");
    } else {
      newSearchParams.set("sort", newSort);
    }
    // Reset limit when sort changes (back to first page of results)
    newSearchParams.delete("limit");
    const queryString = newSearchParams.toString();
    const pathname = window.location.pathname;
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    notifyUrlChange();
  };

  return { sort, updateSort };
}
