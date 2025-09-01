"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "name-a"
  | "name-z";

export function useUrlSort() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sortParam = searchParams.get("sort") || "";
  const sort: SortOption =
    sortParam &&
    ["newest", "price-low", "price-high", "name-a", "name-z"].includes(
      sortParam
    )
      ? (sortParam as SortOption)
      : "newest";

  const updateSort = (newSort: SortOption) => {
    if (newSort === sort) {
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("sort", newSort);
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  };

  return { sort, updateSort };
}
