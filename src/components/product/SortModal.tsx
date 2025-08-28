"use client";
import React from "react";
import { useUrlSort } from "@/hooks/useUrlSort";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import SortButtons from "./SortButtons";
import { FilterButtons } from "./FilterButtons";
import { Product } from "@/types/product";

export function SortModal({
  isSortOpen,
  setIsSortOpen,
  products,
}: {
  isSortOpen: boolean;
  setIsSortOpen: (isOpen: boolean) => void;
  products: Product[];
}) {
  const handleClose = () => {
    setIsSortOpen(false);
  };

  return (
    <div>
      <div
        className={
          "fixed top-0 right-0 h-screen w-full bg-white z-50 transform transition-transform duration-300 flex flex-col" +
          (isSortOpen ? " translate-x-0" : " translate-x-full")
        }
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white z-10 h-16">
          <div className="text-sm flex justify-between items-center h-8 relative mt-4 px-4">
            <p>Filter & Sort</p>
            <button
              className="mr-2 text-sm hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <div className="border-b border-gray-300 w-full mt-2 "></div>
          <p className="text-sm ml-4 mt-2">Sort</p>

          <SortButtons products={products} />
          <FilterButtons products={products} />
        </div>
      </div>
    </div>
  );
}

export default SortModal;
