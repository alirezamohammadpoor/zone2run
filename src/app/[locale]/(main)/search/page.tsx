import { Suspense } from "react";
import { searchProducts } from "@/lib/actions/search";
import SearchResults from "./SearchResults";
import type { Metadata } from "next";
import { localeToCountry } from "@/lib/locale/localeUtils";
import { buildHreflangAlternates } from "@/lib/metadata";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}/search`;
  return {
    title: "Search | Zone2Run",
    description:
      "Search premium running apparel from top Scandinavian brands.",
    alternates: buildHreflangAlternates("/search", locale),
    openGraph: {
      title: "Search | Zone2Run",
      description:
        "Search premium running apparel from top Scandinavian brands.",
      url,
      siteName: "Zone2Run",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Search | Zone2Run",
      description:
        "Search premium running apparel from top Scandinavian brands.",
    },
  };
}

// The query is request-bound by design: the static shell prerenders and
// results render per-request inside the Suspense boundary below.
export default function SearchPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SearchContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function SearchContent({
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
        <span className="text-xs text-gray-500" aria-live="polite" aria-atomic="true">
          {results.totalCount} products
        </span>
      </div>

      {results.products.length > 0 ? (
        <SearchResults
          initialProducts={results.products}
          totalCount={results.totalCount}
          query={q}
        />
      ) : (
        <p className="text-xs text-gray-500 px-2">
          No products found for &quot;{q}&quot;
        </p>
      )}
    </div>
  );
}
