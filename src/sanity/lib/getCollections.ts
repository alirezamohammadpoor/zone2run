import { sanityFetch } from "@/sanity/lib/client";
import type { SanityProduct } from "@/types/sanityProduct";
import {
  COLLECTION_PRODUCT_PROJECTION,
  HERO_IMAGE_PROJECTION,
  EDITORIAL_IMAGES_PROJECTION,
  MENU_IMAGE_PROJECTION,
} from "./groqUtils";

// Extended product type for collection queries that include createdAt
type CollectionProduct = SanityProduct & { createdAt?: string };

// Type for curated product references
type CuratedProductRef = { _id: string; handle?: string };

interface EditorialImage {
  _key: string;
  image: {
    asset: { _id: string; url: string; metadata?: { lqip?: string } };
    alt?: string;
  };
  caption?: string;
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
  curatedProducts?: Array<{ _id: string }>
): Promise<SanityProduct[]> {
  const shopifyIdStr = shopifyId ? shopifyId.toString() : "";

  const baseFilter = `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))]`;

  // Helper to sort products - curated order first, then by createdAt
  const sortProducts = (products: CollectionProduct[]): CollectionProduct[] => {
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

  const params: Record<string, unknown> = { collectionId, shopifyIdStr };
  const productsQuery = `${baseFilter}${COLLECTION_PRODUCT_PROJECTION}`;

  try {
    const products = await sanityFetch<CollectionProduct[]>(productsQuery, params);
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

    const products = await sanityFetch<CollectionProduct[]>(productsQuery, {
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
