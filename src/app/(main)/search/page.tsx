import { Suspense } from "react";
import { searchProducts } from "@/lib/actions/search";
import ProductGrid from "@/components/ProductGrid";
import PaginationNav from "@/components/PaginationNav";
import type { SanityProduct } from "@/types/sanityProduct";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | Zone2Run",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);

  if (!q || q.length < 2) {
    return (
      <div className="px-4 py-12">
        <h1 className="text-xs mb-8">Search</h1>
        <p className="text-xs text-gray-500">
          Enter a search term to find products.
        </p>
      </div>
    );
  }

  const results = await searchProducts(q, currentPage);

  return (
    <div className="px-2 py-8">
      <div className="flex justify-between items-center mb-4 px-2">
        <h1 className="text-xs">Results for &quot;{q}&quot;</h1>
        <span className="text-xs text-gray-500">
          {results.totalCount} products
        </span>
      </div>

      {results.products.length > 0 ? (
        <>
          <ProductGrid products={results.products as SanityProduct[]} />
          {results.totalPages > 1 && (
            <Suspense fallback={<div className="my-8 h-10" />}>
              <PaginationNav
                currentPage={currentPage}
                totalPages={results.totalPages}
                className="my-8"
              />
            </Suspense>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500 px-2">
          No products found for &quot;{q}&quot;
        </p>
      )}
    </div>
  );
}
