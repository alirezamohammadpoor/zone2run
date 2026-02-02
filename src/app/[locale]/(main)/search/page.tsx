import { Suspense } from "react";
import { searchProducts } from "@/lib/actions/search";
import ProductGrid from "@/components/ProductGrid";
import SearchResults from "./SearchResults";
import type { SanityProduct } from "@/types/sanityProduct";
import type { Metadata } from "next";
import { localeToCountry } from "@/lib/locale/localeUtils";

export const metadata: Metadata = {
  title: "Search | Zone2Run",
};

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const country = localeToCountry(locale);

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

  const results = await searchProducts(q, country);

  return (
    <div className="px-2 py-8">
      <div className="flex justify-between items-center mb-4 px-2">
        <h1 className="text-xs">Results for &quot;{q}&quot;</h1>
        <span className="text-xs text-gray-500">
          {results.totalCount} products
        </span>
      </div>

      {results.products.length > 0 ? (
        <Suspense fallback={<ProductGrid products={results.products as SanityProduct[]} />}>
          <SearchResults
            initialProducts={results.products}
            totalCount={results.totalCount}
            query={q}
          />
        </Suspense>
      ) : (
        <p className="text-xs text-gray-500 px-2">
          No products found for &quot;{q}&quot;
        </p>
      )}
    </div>
  );
}
