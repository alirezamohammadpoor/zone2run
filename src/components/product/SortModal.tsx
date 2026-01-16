"use client";
import FocusLock from "react-focus-lock";
import SortButtons from "./SortButtons";
import { FilterButtons } from "./FilterButtons";
import type { SanityProduct } from "@/types/sanityProduct";

export function SortModal({
  isSortOpen,
  setIsSortOpen,
  products,
}: {
  isSortOpen: boolean;
  setIsSortOpen: (isOpen: boolean) => void;
  products: SanityProduct[];
}) {
  const handleClose = () => {
    setIsSortOpen(false);
  };

  return (
    <FocusLock disabled={!isSortOpen}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort products"
        inert={!isSortOpen ? true : undefined}
        className={
          "fixed top-0 right-0 h-screen w-full bg-white z-50 transform transition-transform duration-300 flex flex-col" +
          (isSortOpen ? " translate-x-0" : " translate-x-full")
        }
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white z-10 h-16">
          <div className="text-xs flex justify-between items-center h-8 relative mt-4 px-4">
            <p>Filter & Sort</p>
            <button
              className="mr-2 text-xs hover:text-gray-500"
              onClick={handleClose}
              aria-label="Close filter and sort"
            >
              Close
            </button>
          </div>
          <div className="border-b border-gray-300 w-full mt-2 "></div>
          <p className="text-xs ml-4 mt-2">Sort</p>

          <SortButtons />
          <FilterButtons products={products} />
        </div>
      </div>
    </FocusLock>
  );
}

export default SortModal;
