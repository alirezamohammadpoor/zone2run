import { sanityFetch } from "@/sanity/lib/client";
import type { SanityProduct } from "@/types/sanityProduct";
import {
  PRODUCTS_PER_PAGE,
  COLLECTION_PRODUCT_PROJECTION,
  EDITORIAL_IMAGES_PROJECTION,
  MENU_IMAGE_PROJECTION,
} from "./groqUtils";

// Pagination result type
export interface PaginatedCollectionProducts {
  products: SanityProduct[];
  totalCount: number;
  totalPages: number;
}

// Filter options for collection queries
export interface CollectionFilters {
  sizes?: string[];
  categories?: string[];
  brands?: string[];
  sort?: "title" | "price-asc" | "price-desc" | "newest";
}

// Extended product type for collection queries that include createdAt
type CollectionProduct = SanityProduct & { createdAt?: string };

// Type for curated product references
type CuratedProductRef = { _id: string; handle?: string };

interface Collection {
  _id: string;
  title: string;
  slug: { current: string };
  menuImage?: { asset: { _id: string; url: string }; alt?: string };
  sortOrder?: number;
  shopifyId?: number;
  description?: string;
  gridLayout?: "4col" | "3col";
  productsPerImage?: number;
  editorialImages?: Array<{
    _key: string;
    image: {
      asset: { _id: string; url: string; metadata?: { lqip?: string } };
      alt?: string;
    };
    caption?: string;
  }>;
  curatedProducts?: Array<{ _id: string; handle?: string }>;
  products?: SanityProduct[];
}

export async function getAllCollections() {
  const query = `*[_type == "collection"] | order(sortOrder asc, store.title asc) {
    _id,
    "title": store.title,
    "slug": store.slug {
      current
    },
    ${MENU_IMAGE_PROJECTION},
    sortOrder
  }`;

  try {
    return await sanityFetch<Collection[]>(query);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

// Get collection info only (no products) - for hero/LCP optimization
export async function getCollectionInfo(slug: string): Promise<Omit<Collection, 'products'> | null> {
  const query = `*[_type == "collection" && (store.slug.current == $slug || lower(store.slug.current) == lower($slug))][0]{
    _id,
    "title": store.title,
    "shopifyId": store.id,
    description,
    gridLayout,
    productsPerImage,
    ${EDITORIAL_IMAGES_PROJECTION},
    "curatedProducts": curatedProducts[]-> {
      _id,
      "handle": coalesce(shopifyHandle, store.slug.current)
    }
  }`;

  try {
    return await sanityFetch<Omit<Collection, 'products'> | null>(query, { slug });
  } catch (error) {
    console.error(`Error fetching collection info for ${slug}:`, error);
    return null;
  }
}

// Get products for a collection by slug - for streaming with Suspense
// Overload: with page parameter returns paginated result
export async function getCollectionProducts(
  collectionId: string,
  shopifyId: number | undefined,
  curatedProducts: Array<{ _id: string }> | undefined,
  page: number,
  filters?: CollectionFilters
): Promise<PaginatedCollectionProducts>;
// Overload: without page parameter returns array
export async function getCollectionProducts(
  collectionId: string,
  shopifyId?: number,
  curatedProducts?: Array<{ _id: string }>
): Promise<SanityProduct[]>;
// Implementation
export async function getCollectionProducts(
  collectionId: string,
  shopifyId?: number,
  curatedProducts?: Array<{ _id: string }>,
  page?: number,
  filters?: CollectionFilters
): Promise<SanityProduct[] | PaginatedCollectionProducts> {
  const shopifyIdStr = shopifyId ? shopifyId.toString() : "";

  // Build dynamic filter conditions
  let sizeFilter = "";
  let categoryFilter = "";
  let brandFilter = "";

  if (filters?.sizes && filters.sizes.length > 0) {
    sizeFilter = `&& count(store.variants[@->store.option1 in $filterSizes || @->store.option2 in $filterSizes]) > 0`;
  }

  if (filters?.categories && filters.categories.length > 0) {
    categoryFilter = `&& (
      category->slug.current in $filterCategories ||
      category->parentCategory->slug.current in $filterCategories ||
      category->parentCategory->parentCategory->slug.current in $filterCategories
    )`;
  }

  if (filters?.brands && filters.brands.length > 0) {
    brandFilter = `&& brand->slug.current in $filterBrands`;
  }

  const baseFilter = `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))${sizeFilter}${categoryFilter}${brandFilter}]`;

  // Helper to sort products - respects filters.sort or falls back to curated/date order
  const sortProducts = (products: CollectionProduct[], sortOption?: CollectionFilters["sort"]): CollectionProduct[] => {
    // If a sort option is specified, use it
    if (sortOption) {
      switch (sortOption) {
        case "title":
          return [...products].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        case "price-asc":
          return [...products].sort((a, b) => {
            const aPrice = a.priceRange?.minVariantPrice || 0;
            const bPrice = b.priceRange?.minVariantPrice || 0;
            return aPrice - bPrice;
          });
        case "price-desc":
          return [...products].sort((a, b) => {
            const aPrice = a.priceRange?.minVariantPrice || 0;
            const bPrice = b.priceRange?.minVariantPrice || 0;
            return bPrice - aPrice;
          });
        case "newest":
          return [...products].sort((a, b) => {
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
          });
      }
    }

    // Default: curated order then createdAt
    if (curatedProducts && curatedProducts.length > 0) {
      const curatedIds = new Map(
        curatedProducts.map((p: { _id: string }, idx: number) => [p._id, idx])
      );

      products.sort((a: CollectionProduct, b: CollectionProduct) => {
        const aInCurated = curatedIds.has(a._id);
        const bInCurated = curatedIds.has(b._id);

        if (aInCurated && bInCurated) {
          const aIdx = curatedIds.get(a._id) ?? 0;
          const bIdx = curatedIds.get(b._id) ?? 0;
          return Number(aIdx) - Number(bIdx);
        }
        if (aInCurated) return -1;
        if (bInCurated) return 1;

        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return Number(bDate) - Number(aDate);
      });
    } else {
      products.sort((a: CollectionProduct, b: CollectionProduct) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return Number(bDate) - Number(aDate);
      });
    }
    return products;
  };

  // Build params object with all needed values
  const params: Record<string, unknown> = { collectionId, shopifyIdStr };
  if (filters?.sizes?.length) params.filterSizes = filters.sizes;
  if (filters?.categories?.length) params.filterCategories = filters.categories;
  if (filters?.brands?.length) params.filterBrands = filters.brands;

  // If page is provided, use pagination
  if (page !== undefined) {
    const countQuery = `count(${baseFilter})`;
    const productsQuery = `${baseFilter}${COLLECTION_PRODUCT_PROJECTION}`;

    try {
      const [totalCount, allProducts] = await Promise.all([
        sanityFetch<number>(countQuery, params),
        sanityFetch<CollectionProduct[]>(productsQuery, params),
      ]);

      // Sort all products first (respects sort option or curated order)
      const sortedProducts = sortProducts(allProducts, filters?.sort);

      // Then apply pagination slice
      const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
      const paginatedProducts = sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

      return {
        products: paginatedProducts,
        totalCount,
        totalPages: Math.ceil(totalCount / PRODUCTS_PER_PAGE),
      };
    } catch (error) {
      console.error(`Error fetching paginated products for collection ${collectionId}:`, error);
      return { products: [], totalCount: 0, totalPages: 0 };
    }
  }

  // Legacy: no pagination
  const productsQuery = `${baseFilter}${COLLECTION_PRODUCT_PROJECTION}`;

  try {
    let products = await sanityFetch<CollectionProduct[]>(productsQuery, params);

    return sortProducts(products) || [];
  } catch (error) {
    console.error(`Error fetching products for collection ${collectionId}:`, error);
    return [];
  }
}

// Get products by collection ID (for homepage modules)
export async function getProductsByCollectionId(
  collectionId: string
): Promise<SanityProduct[]> {
  // First get the collection to access shopifyId and curatedProducts
  const collectionQuery = `*[_type == "collection" && _id == $collectionId][0]{
    _id,
    "shopifyId": store.id,
    "curatedProducts": curatedProducts[]-> {
      _id
    }
  }`;

  const productsQuery = `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))]${COLLECTION_PRODUCT_PROJECTION}`;

  try {
    const collection = await sanityFetch<Collection | null>(collectionQuery, { collectionId });
    if (!collection) return [];

    const shopifyIdStr = collection.shopifyId
      ? collection.shopifyId.toString()
      : "";

    let products = await sanityFetch<CollectionProduct[]>(productsQuery, {
      collectionId: collection._id,
      shopifyIdStr: shopifyIdStr,
    });

    // Sort by curated order if available, otherwise by createdAt
    if (collection.curatedProducts && collection.curatedProducts.length > 0) {
      const curatedIds = new Map(
        collection.curatedProducts.map((p: CuratedProductRef, idx: number) => [p._id, idx])
      );

      products.sort((a: CollectionProduct, b: CollectionProduct) => {
        const aInCurated = curatedIds.has(a._id);
        const bInCurated = curatedIds.has(b._id);

        if (aInCurated && bInCurated) {
          const aIdx = curatedIds.get(a._id) ?? 0;
          const bIdx = curatedIds.get(b._id) ?? 0;
          return Number(aIdx) - Number(bIdx);
        }
        if (aInCurated) return -1;
        if (bInCurated) return 1;

        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return Number(bDate) - Number(aDate);
      });
    } else {
      products.sort((a: CollectionProduct, b: CollectionProduct) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return Number(bDate) - Number(aDate);
      });
    }

    return products || [];
  } catch (error) {
    console.error(
      `Error fetching products for collection ${collectionId}:`,
      error
    );
    return [];
  }
}

// Available filter options for a collection
export interface CollectionFilterOptions {
  sizes: string[];
  categories: { slug: string; title: string }[];
  brands: { slug: string; name: string }[];
}

/**
 * Fetches available filter options for a collection's products.
 * Returns unique sizes, categories, and brands across all products.
 */
export async function getCollectionFilterOptions(
  collectionId: string,
  shopifyId?: number
): Promise<CollectionFilterOptions> {
  const shopifyIdStr = shopifyId ? shopifyId.toString() : "";

  const query = `{
    "sizes": array::unique(*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))].store.variants[]->store.option1),
    "categories": array::unique(*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))] {
      "slug": category->slug.current,
      "title": category->title
    }),
    "brands": array::unique(*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))] {
      "slug": brand->slug.current,
      "name": brand->name
    })
  }`;

  try {
    const result = await sanityFetch<{
      sizes: (string | null)[];
      categories: ({ slug: string; title: string } | null)[];
      brands: ({ slug: string; name: string } | null)[];
    }>(query, { collectionId, shopifyIdStr });

    return {
      sizes: result.sizes.filter((s): s is string => s !== null),
      categories: result.categories.filter(
        (c): c is { slug: string; title: string } => c !== null && c.slug !== null
      ),
      brands: result.brands.filter(
        (b): b is { slug: string; name: string } => b !== null && b.slug !== null
      ),
    };
  } catch (error) {
    console.error(`Error fetching filter options for collection ${collectionId}:`, error);
    return { sizes: [], categories: [], brands: [] };
  }
}
