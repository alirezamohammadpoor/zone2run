import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchProductGrid from "./SearchProductGrid";
import { getAllProducts } from "@/lib/product/getAllProducts";
import { useSearchStore } from "@/store/searchStore";
import { useModalScroll } from "@/hooks/useModalScroll";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import SearchResultsSkeleton from "@/components/skeletons/SearchResultsSkeleton";

function SearchModal() {
  const router = useRouter();
  const {
    query,
    filters,
    results,
    isLoading,
    isSearchOpen,
    setIsSearchOpen,
    setResults,
  } = useSearchStore();

  const { unlockScroll } = useModalScrollRestoration();

  const handleClose = () => {
    setIsSearchOpen(false);
    // Delay scroll restoration to allow modal animation to complete
    setTimeout(() => {
      unlockScroll();
    }, 300);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  useModalScroll(isSearchOpen);

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getAllProducts();
      setResults(products);
    };
    fetchProducts();
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className={
          "fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300" +
          (isSearchOpen ? " opacity-100" : " opacity-0 pointer-events-none")
        }
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={
          "fixed top-0 right-0 h-screen w-full bg-white z-50 transform transition-transform duration-300 overflow-hidden flex flex-col" +
          (isSearchOpen ? " translate-x-0" : " translate-x-full")
        }
      >
        {/* Fixed Header */}
        <div className="bg-white z-10 h-16 flex-shrink-0">
          {/* Modal Header */}
          <div className="text-xs flex justify-between items-center h-8 relative mt-4 px-2">
            <span>Search</span>
            <button
              className="mr-2 text-xs hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <div className="border-b border-gray-300 w-full mt-2"></div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Menu */}
          <div className="mt-4 flex justify-center">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-[100%] mx-auto px-2 py-2 border-b border-gray-300 text-sm font-light focus:outline-none"
            />
          </div>

          <span className="text-gray-500 text-xs ml-2 block mt-16">
            Suggested pages
          </span>

          <span className="text-xs ml-2 block mt-4">FAQ</span>
          <span className="text-xs ml-2 block mt-2">
            Contact us
          </span>
          <span className="text-xs ml-2 block mt-2">About us</span>

          <span className="text-gray-500 text-xs ml-2 block mt-16 mb-4">
            Suggested products
          </span>
          {isLoading ? (
            <SearchResultsSkeleton />
          ) : (
            <SearchProductGrid products={results} />
          )}
        </div>
      </div>
    </>
  );
}

export default SearchModal;
