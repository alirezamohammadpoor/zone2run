"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import LocaleLink from "@/components/LocaleLink";
import { searchProducts } from "@/lib/actions/search";
import { enrichRecentlyViewedPrices } from "@/lib/actions/recentlyViewed";
import { useLocale } from "@/lib/locale/LocaleContext";
import { useRecentlyViewedStore } from "@/lib/recentlyViewed/store";
import { useModalScrollRestoration } from "@/hooks/useModalScrollRestoration";
import ProductCard from "./ProductCard";
import RecentlyViewedSection from "./RecentlyViewedSection";
import { Backdrop } from "@/components/ui/Backdrop";
import { NavLink } from "@/components/ui/NavLink";
import type { SanitySearchResult } from "@/lib/actions/search";
import type { CardProduct } from "@/types/cardProduct";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SanitySearchResult | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<CardProduct[]>([]);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedDefault = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { unlockScroll } = useModalScrollRestoration();
  const storedProducts = useRecentlyViewedStore((state) => state.products);
  const { country } = useLocale();

  // Focus input when modal opens (autoFocus only works on mount)
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await searchProducts(value, country);
        setResults(data);
      });
    }, 300);
  };

  const handleInputFocus = () => {
    if (!hasLoadedDefault.current) {
      hasLoadedDefault.current = true;
      startTransition(async () => {
        // Fetch new arrivals + enrich recently viewed prices in parallel
        const [data, enriched] = await Promise.all([
          searchProducts("", country),
          storedProducts.length > 0
            ? enrichRecentlyViewedPrices(storedProducts, country)
            : Promise.resolve([]),
        ]);
        setResults(data);
        setRecentlyViewed(enriched);
      });
    }
  };

  const handleClose = () => {
    setQuery("");
    setResults(null);
    setRecentlyViewed([]);
    hasLoadedDefault.current = false;
    onClose();
    setTimeout(() => {
      unlockScroll();
    }, 300);
  };

  return (
    <>
      <Backdrop isOpen={isOpen} onClick={handleClose} blur={false} />

      {/* Modal - Full screen on mobile, 25vw on desktop (matches CartModal) */}
      <div
        className={
          "fixed top-0 right-0 h-[100dvh] w-full xl:w-1/2 bg-white z-50 transform transition-transform duration-300 overflow-hidden flex flex-col" +
          (isOpen ? " translate-x-0" : " translate-x-full")
        }
      >
        {/* Fixed Header */}
        <div className="bg-white z-10 flex-shrink-0">
          <div className="text-xs flex justify-between items-center h-12 xl:h-16 px-4 xl:px-4">
            <span>Search</span>
            <button
              className="text-xs hover:text-gray-500"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <div className="border-b border-gray-300 w-full" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 xl:px-4">
          {/* Search Input */}
          <div className="mt-6">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="What are you looking for?"
              className="w-full py-2 border-b border-gray-300 text-base md:text-sm focus:outline-none focus:border-black"
            />
          </div>

          {isPending && query && (
            <p className="text-xs text-gray-500 mt-4">Searching...</p>
          )}

          {/* Brands */}
          {results?.brands && results.brands.length > 0 && (
            <div className="mt-8">
              <span className="text-gray-500 text-xs block mb-3">Brands</span>
              {results.brands.map((brand) => (
                <NavLink
                  key={brand._id}
                  href={`/brands/${brand.slug}`}
                  onClick={handleClose}
                  className="mt-2"
                >
                  {brand.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Collections */}
          {results?.collections && results.collections.length > 0 && (
            <div className="mt-8">
              <span className="text-gray-500 text-xs block mb-3">
                Collections
              </span>
              {results.collections.map((collection) => (
                <NavLink
                  key={collection._id}
                  href={`/collections/${collection.slug}`}
                  onClick={handleClose}
                  className="mt-2"
                >
                  {collection.title}
                </NavLink>
              ))}
            </div>
          )}

          {/* Recently Viewed - shown in default state (no search query) */}
          {results?.isDefault && (
            <RecentlyViewedSection
              products={recentlyViewed}
              onProductClick={handleClose}
            />
          )}

          {/* Products */}
          {results?.products && results.products.length > 0 && (
            <div className="mt-12 mb-8">
              <div className="flex justify-between items-center mb-4 text-xs">
                <span>{results.isDefault ? "New arrivals" : "Results"}</span>
                <span>{results.totalCount} products</span>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                {results.products.map((product) => (
                  <LocaleLink
                    key={product._id}
                    href={`/products/${product.handle}`}
                    onClick={handleClose}
                  >
                    <ProductCard
                      product={product as CardProduct}
                      sizes="(max-width: 1279px) calc(50vw - 12px), calc(25vw - 10px)"
                      disableGallery
                    />
                  </LocaleLink>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {results &&
            !results.isDefault &&
            results.products?.length === 0 &&
            results.brands?.length === 0 &&
            results.collections?.length === 0 && (
              <p className="text-xs text-gray-500 mt-12">
                No results found for &quot;{query}&quot;
              </p>
            )}
        </div>

        {/* See results button - fixed at bottom */}
        {results?.products &&
          results.products.length > 0 &&
          !results.isDefault && (
            <div className="bg-white border-t border-gray-300 p-4 xl:px-16 flex-shrink-0">
              <LocaleLink
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={handleClose}
                className="block w-full bg-black text-white text-center py-3 text-xs hover:bg-gray-800"
              >
                See results ({results.totalCount})
              </LocaleLink>
            </div>
          )}
      </div>
    </>
  );
}
