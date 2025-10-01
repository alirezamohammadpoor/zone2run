"use client";
import React, { useState } from "react";
import { SortModal } from "./SortModal";
import type { SanityProduct } from "@/types/sanityProduct";

function FilterBar({ products }: { products: SanityProduct[] }) {
  const [isSortOpen, setIsSortOpen] = useState(false);

  return (
    <div>
      <div className="flex fixed bottom-0 w-full h-12 z-50 bg-white justify-between items-center px-4">
        <button className="text-sm ml-2">View</button>
        <button className="text-sm mr-2" onClick={() => setIsSortOpen(true)}>
          Filter & Sort
        </button>
      </div>
      <SortModal
        isSortOpen={isSortOpen}
        setIsSortOpen={setIsSortOpen}
        products={products}
      />
    </div>
  );
}

export default FilterBar;
