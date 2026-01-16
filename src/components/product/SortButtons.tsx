"use client";

import { SortOption, useUrlSort } from "@/hooks/useUrlSort";

export default function SortButtons() {
  const { sort, updateSort } = useUrlSort();

  return (
    <fieldset className="space-y-2 ml-4 mt-2">
      <legend className="sr-only">Sort products by</legend>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="radio"
          name="sort"
          value="newest"
          checked={sort === "newest"}
          onChange={(e) => updateSort(e.target.value as SortOption)}
        />
        Newest
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="radio"
          name="sort"
          value="price-low"
          checked={sort === "price-low"}
          onChange={(e) => updateSort(e.target.value as SortOption)}
        />
        Price: Low to High
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="radio"
          name="sort"
          value="price-high"
          checked={sort === "price-high"}
          onChange={(e) => updateSort(e.target.value as SortOption)}
        />
        Price: High to Low
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="radio"
          name="sort"
          value="name-a"
          checked={sort === "name-a"}
          onChange={(e) => updateSort(e.target.value as SortOption)}
        />
        Name: A to Z
      </label>

      <label className="flex items-center gap-2 text-xs">
        <input
          type="radio"
          name="sort"
          value="name-z"
          checked={sort === "name-z"}
          onChange={(e) => updateSort(e.target.value as SortOption)}
        />
        Name: Z to A
      </label>
    </fieldset>
  );
}
