"use server";

import { sanityFetch } from "@/sanity/lib/client";
import { buildPaginationSlice, SEARCH_PAGE_SIZE } from "@/sanity/lib/groqUtils";
import type { SanityProduct } from "@/types/sanityProduct";

export interface SearchBrand {
  _id: string;
  name: string;
  slug: string;
}

export interface SearchCollection {
  _id: string;
  title: string;
  slug: string;
}

export interface SanitySearchResult {
  products: SearchProduct[];
  brands: SearchBrand[];
  collections: SearchCollection[];
  totalCount: number;
  isDefault: boolean;
}

// Product type for search results - compatible with ProductCard
export type SearchProduct = Pick<
  SanityProduct,
  "_id" | "title" | "handle" | "mainImage" | "priceRange" | "brand" | "vendor" | "gallery"
>;

// Shared projection for search results - includes gallery for ProductCard
const SEARCH_PROJECTION = `{
  _id,
  "title": coalesce(title, store.title),
  "handle": coalesce(shopifyHandle, store.slug.current),
  "vendor": store.vendor,
  "mainImage": {
    "url": coalesce(mainImage.asset->url, store.previewImageUrl),
    "alt": coalesce(mainImage.alt, store.title),
    "lqip": mainImage.asset->metadata.lqip
  },
  "gallery": gallery[] {
    "url": asset->url,
    alt,
    "lqip": asset->metadata.lqip
  } | order(_key asc),
  "priceRange": {
    "minVariantPrice": store.priceRange.minVariantPrice,
    "maxVariantPrice": store.priceRange.maxVariantPrice
  },
  "brand": brand-> { _id, name, "slug": slug.current }
}`;

// Filter-based search across multiple fields
// score() cannot dereference (brand->name), so we use filter + score on direct fields
const buildSearchProductsQuery = (page: number) => `
*[_type == "product" && (
  title match $searchPattern ||
  shopifyHandle match $searchPattern ||
  store.vendor match $searchPattern ||
  brand->name match $searchPattern ||
  category->title match $searchPattern ||
  $searchTerm in tags[]
)] | score(
  boost(title match $searchPattern, 5),
  boost(shopifyHandle match $searchPattern, 2),
  boost(store.vendor match $searchPattern, 2)
) | order(_score desc)${buildPaginationSlice(page)} ${SEARCH_PROJECTION}`;

// Default: newest products
const NEW_ARRIVALS = `
*[_type == "product"] | order(_createdAt desc)[0...12] ${SEARCH_PROJECTION}`;

// Brand search
const SEARCH_BRANDS = `
*[_type == "brand" && name match $searchPattern] | order(name asc)[0...4] {
  _id,
  name,
  "slug": slug.current
}`;

// Collection search
const SEARCH_COLLECTIONS = `
*[_type == "collection" && store.title match $searchPattern] | order(store.title asc)[0...4] {
  _id,
  "title": store.title,
  "slug": store.slug.current
}`;

// Count total matching products (not limited by slice)
const COUNT_PRODUCTS = `
count(*[_type == "product" && (
  title match $searchPattern ||
  shopifyHandle match $searchPattern ||
  store.vendor match $searchPattern ||
  brand->name match $searchPattern ||
  category->title match $searchPattern ||
  $searchTerm in tags[]
)])`;

/**
 * Initial search — fetches page 1 products, brands, collections, and total count.
 */
export async function searchProducts(
  query: string
): Promise<SanitySearchResult> {
  // Empty query → return new arrivals only
  if (!query || query.length < 2) {
    const products = await sanityFetch<SearchProduct[]>(NEW_ARRIVALS);
    return {
      products,
      brands: [],
      collections: [],
      totalCount: products.length,
      isDefault: true,
    };
  }

  // Wildcard pattern for partial matching
  const searchPattern = `${query}*`;

  // Parallel fetch for performance (includes count query)
  const [products, brands, collections, totalCount] = await Promise.all([
    sanityFetch<SearchProduct[]>(buildSearchProductsQuery(1), {
      searchTerm: query,
      searchPattern,
    }),
    sanityFetch<SearchBrand[]>(SEARCH_BRANDS, { searchPattern }),
    sanityFetch<SearchCollection[]>(SEARCH_COLLECTIONS, { searchPattern }),
    sanityFetch<number>(COUNT_PRODUCTS, {
      searchTerm: query,
      searchPattern,
    }),
  ]);

  return {
    products,
    brands,
    collections,
    totalCount,
    isDefault: false,
  };
}

/**
 * Load More — fetches the next page of search results.
 * Called from client component to append more products.
 */
export async function searchProductsPage(
  query: string,
  page: number
): Promise<SearchProduct[]> {
  if (!query || query.length < 2 || page < 1) return [];

  const searchPattern = `${query}*`;

  return sanityFetch<SearchProduct[]>(buildSearchProductsQuery(page), {
    searchTerm: query,
    searchPattern,
  });
}
