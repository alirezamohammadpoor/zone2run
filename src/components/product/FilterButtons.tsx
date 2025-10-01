"use client";

import React, { useState, useMemo, useRef } from "react";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import type { SanityProduct } from "@/types/sanityProduct";

interface FilterButtonsProps {
  products: SanityProduct[];
}

export function FilterButtons({ products }: FilterButtonsProps) {
  const { filters, updateFilters } = useUrlFilters();
  const [open, setOpen] = useState(false);

  // persistent local filters using useRef to survive remounts
  const localFiltersRef = useRef(filters);

  // useState to trigger re-renders
  const [, forceUpdate] = useState({});

  const handleCategoryToggle = (slug: string) => {
    const current = localFiltersRef.current;
    const isSelected = current.category.includes(slug);

    const updated = {
      ...current,
      category: isSelected
        ? current.category.filter((c) => c !== slug)
        : [...current.category, slug],
    };

    localFiltersRef.current = updated; // update persistent ref
    updateFilters(updated); // push to URL

    forceUpdate({}); // trigger re-render to reflect UI immediately
  };

  const handleClearAll = () => {
    const cleared = { ...localFiltersRef.current, category: [] };
    localFiltersRef.current = cleared;
    updateFilters(cleared);
    forceUpdate({});
  };

  // Memoize categories
  const categories = useMemo(() => {
    return products.reduce((acc, product) => {
      const category = product.sanity?.category;
      const slugCurrent = category?.slug?.current;
      const title = category?.title;

      if (!slugCurrent || !title || !category?._id) return acc;

      const existing = acc.find((cat) => cat.title === title);
      if (!existing) {
        acc.push({
          _id: category._id,
          title,
          slug: { current: slugCurrent },
          count: 1,
        });
      } else {
        existing.count++;
      }

      return acc;
    }, [] as Array<{ _id: string; title: string; slug: { current: string }; count: number }>);
  }, [products]);

  return (
    <div className="border-b py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-[95%] text-left flex justify-between items-center ml-2"
      >
        <span className="font-medium text-sm uppercase">Category</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-2 ml-2">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-black transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => {
              const isSelected = localFiltersRef.current.category.includes(
                category.slug.current
              );

              return (
                <button
                  key={category._id}
                  aria-pressed={isSelected}
                  className={`py-1 px-4 border text-center text-sm transition-colors ${
                    isSelected
                      ? "bg-black text-white border-black"
                      : "border-gray-300 hover:bg-black hover:text-white hover:border-black"
                  }`}
                  onClick={() => handleCategoryToggle(category.slug.current)}
                >
                  {category.title} ({category.count})
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
