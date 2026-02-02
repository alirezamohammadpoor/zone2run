"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import LoadMoreButton from "@/components/LoadMoreButton";
import { searchProductsPage } from "@/lib/actions/search";
import type { SearchProduct } from "@/lib/actions/search";
import type { SanityProduct } from "@/types/sanityProduct";
import { SEARCH_PAGE_SIZE } from "@/sanity/lib/groqUtils";

interface SearchResultsProps {
  initialProducts: SearchProduct[];
  totalCount: number;
  query: string;
}

export default function SearchResults({
  initialProducts,
  totalCount,
  query,
}: SearchResultsProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read limit from URL for shareable state
  const urlLimit = searchParams.get("limit");
  const visibleCount = urlLimit
    ? Math.max(SEARCH_PAGE_SIZE, parseInt(urlLimit, 10) || SEARCH_PAGE_SIZE)
    : SEARCH_PAGE_SIZE;

  // How many pages we need fetched to show `visibleCount` products
  const pagesNeeded = Math.ceil(visibleCount / SEARCH_PAGE_SIZE);
  const fetchedRef = useRef(false);

  // On mount, if URL has ?limit= that requires more pages, fetch them
  useEffect(() => {
    if (fetchedRef.current || pagesNeeded <= page || loading) return;
    if (products.length >= visibleCount || products.length >= totalCount) return;

    fetchedRef.current = true;
    const fetchRemainingPages = async () => {
      setLoading(true);
      const pagesToFetch = [];
      for (let p = page + 1; p <= pagesNeeded; p++) {
        pagesToFetch.push(p);
      }
      const results = await Promise.all(
        pagesToFetch.map((p) => searchProductsPage(query, p))
      );
      setProducts((prev) => [...prev, ...results.flat()]);
      setPage(pagesNeeded);
      setLoading(false);
    };
    fetchRemainingPages();
  }, [pagesNeeded, page, loading, products.length, visibleCount, totalCount, query]);

  const visibleProducts = products.slice(0, visibleCount);
  const remainingCount = Math.max(0, totalCount - visibleCount);

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    setLoading(true);

    const newProducts = await searchProductsPage(query, nextPage);
    setProducts((prev) => [...prev, ...newProducts]);
    setPage(nextPage);

    // Update URL with new limit
    const newLimit = visibleCount + SEARCH_PAGE_SIZE;
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    setLoading(false);
  }, [page, query, visibleCount, searchParams, router, pathname]);

  return (
    <>
      <ProductGrid products={visibleProducts as SanityProduct[]} />
      <LoadMoreButton
        onLoadMore={handleLoadMore}
        remainingCount={remainingCount}
      />
    </>
  );
}
