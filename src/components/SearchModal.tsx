import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchProductGrid from "./SearchProductGrid";
import { getAllProducts } from "@/sanity/lib/getData";
import { useSearchStore } from "@/store/searchStore";

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

  const handleClose = () => {
    setIsSearchOpen(false);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

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
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClose}
        />
      )}

      {/* Modal */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-white z-50 transform transition-transform duration-300 ${
          isSearchOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white z-10">
          {/* Modal Header */}
          <div className="text-xs flex justify-between items-center h-8 relative mt-6 px-4">
            <span>Search</span>
            <button
              className="mr-2 text-xs hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <div className="border-b border-gray-300 w-full mt-4"></div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-full">
          {/* Navigation Menu */}
          <div className="mt-4 flex justify-center">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-[100%] mx-auto px-4 py-2 border-b border-gray-300 text-xl font-light focus:outline-none"
            />
          </div>

          <span className="text-gray-500 text-sm ml-4 block mt-16">
            Suggested pages
          </span>

          <span className="text-sm font-normal ml-4 block mt-4">FAQ</span>
          <span className="text-sm font-normal ml-4 block mt-2">
            Contact us
          </span>
          <span className="text-sm font-normal ml-4 block mt-2">About us</span>

          <span className="text-gray-500 text-sm ml-4 block mt-16 mb-4">
            Suggested products
          </span>
          <SearchProductGrid products={results} />
        </div>
      </div>
    </>
  );
}

export default SearchModal;
