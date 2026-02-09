import { sanityFetch } from "@/sanity/lib/client";
import type { PLPProduct } from "@/types/plpProduct";
import {
  COLLECTION_PRODUCT_PROJECTION,
  HERO_IMAGE_PROJECTION,
  EDITORIAL_IMAGES_PROJECTION,
  MENU_IMAGE_PROJECTION,
  type EditorialImage,
} from "./groqUtils";
import { enrichWithLocalePrices } from "@/lib/locale/enrichPrices";
import { deduplicateSizes, type RawProductWithSizes } from "./deduplicateSizes";

/** Sort products: curated order first, then by _createdAt desc */
function sortByCuratedOrder(
  products: PLPProduct[],
  curatedProducts?: Array<{ _id: string }>
): PLPProduct[] {
  if (curatedProducts && curatedProducts.length > 0) {
    const curatedIds = new Map(
      curatedProducts.map((p, idx) => [p._id, idx])
    );

    products.sort((a, b) => {
      const aInCurated = curatedIds.has(a._id);
      const bInCurated = curatedIds.has(b._id);

      if (aInCurated && bInCurated) {
        return (curatedIds.get(a._id) ?? 0) - (curatedIds.get(b._id) ?? 0);
      }
      if (aInCurated) return -1;
      if (bInCurated) return 1;

      const aDate = a._createdAt ? new Date(a._createdAt).getTime() : 0;
      const bDate = b._createdAt ? new Date(b._createdAt).getTime() : 0;
      return bDate - aDate;
    });
  } else {
    products.sort((a, b) => {
      const aDate = a._createdAt ? new Date(a._createdAt).getTime() : 0;
      const bDate = b._createdAt ? new Date(b._createdAt).getTime() : 0;
      return bDate - aDate;
    });
  }
  return products;
}

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
  heroImage?: EditorialImage;
  editorialImages?: EditorialImage[];
  curatedProducts?: Array<{ _id: string; handle?: string }>;
  products?: PLPProduct[];
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
    ${HERO_IMAGE_PROJECTION},
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

// Get products for a collection - returns all products (Load More handles display)
export async function getCollectionProducts(
  collectionId: string,
  shopifyId?: number,
  curatedProducts?: Array<{ _id: string }>,
  country?: string,
): Promise<PLPProduct[]> {
  const shopifyIdStr = shopifyId ? shopifyId.toString() : "";

  const baseFilter = `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))]`;

  const params: Record<string, unknown> = { collectionId, shopifyIdStr };
  const productsQuery = `${baseFilter}${COLLECTION_PRODUCT_PROJECTION}`;

  try {
    const raw = await sanityFetch<RawProductWithSizes[]>(productsQuery, params);
    let products = deduplicateSizes(raw);
    products = sortByCuratedOrder(products, curatedProducts);
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error(`Error fetching products for collection ${collectionId}:`, error);
    return [];
  }
}

// Get products by collection ID (for homepage modules)
export async function getProductsByCollectionId(
  collectionId: string,
  country?: string,
): Promise<PLPProduct[]> {
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

    const raw = await sanityFetch<RawProductWithSizes[]>(productsQuery, {
      collectionId: collection._id,
      shopifyIdStr: shopifyIdStr,
    });

    let products = deduplicateSizes(raw);
    products = sortByCuratedOrder(products, collection.curatedProducts);
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error(
      `Error fetching products for collection ${collectionId}:`,
      error
    );
    return [];
  }
}
