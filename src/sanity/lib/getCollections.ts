import { sanityFetch } from "@/sanity/lib/client";
import type { SanityProduct } from "@/types/sanityProduct";
import { PRODUCTS_PER_PAGE } from "./groqUtils";

// Pagination result type
export interface PaginatedCollectionProducts {
  products: SanityProduct[];
  totalCount: number;
  totalPages: number;
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
    menuImage {
      asset-> {
        _id,
        url,
        metadata { lqip }
      },
      alt
    },
    sortOrder
  }`;

  try {
    return await sanityFetch<Collection[]>(query);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const collectionQuery = `*[_type == "collection" && (store.slug.current == $slug || lower(store.slug.current) == lower($slug))][0]{
    _id,
    "title": store.title,
    "shopifyId": store.id,
    description,
    gridLayout,
    productsPerImage,
    editorialImages[] {
      _key,
      image {
        asset-> {
          _id,
          url,
          metadata { lqip }
        },
        alt
      },
      caption
    },
    "curatedProducts": curatedProducts[]-> {
      _id,
      "handle": coalesce(shopifyHandle, store.slug.current)
    }
  }`;

  const productsQuery = `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))]{
    _id,
    "title": coalesce(title, store.title),
    "handle": coalesce(shopifyHandle, store.slug.current),
    "description": store.descriptionHtml,
    "vendor": store.vendor,
    "productType": store.productType,
    "tags": store.tags,
    "priceRange": {
      "minVariantPrice": store.priceRange.minVariantPrice,
      "maxVariantPrice": store.priceRange.maxVariantPrice
    },
    "mainImage": {
      "url": store.previewImageUrl,
      "alt": store.title,
      "lqip": mainImage.asset->metadata.lqip
    },
    "gallery": gallery[] {
      "url": asset->url,
      alt,
      "lqip": asset->metadata.lqip
    } | order(_key asc),
    "options": store.options,
    "variants": store.variants[]-> {
      "id": store.gid,
      "title": store.title,
      "sku": store.sku,
      "price": store.price,
      "compareAtPrice": store.compareAtPrice,
      "available": store.inventory.isAvailable,
      "selectedOptions": [
        select(store.option1 != null => {"name": "Size", "value": store.option1}),
        select(store.option2 != null => {"name": "Color", "value": store.option2}),
        select(store.option3 != null => {"name": "Material", "value": store.option3})
      ]
    },
    category-> {
      _id,
      title,
      "slug": slug.current,
      categoryType,
      parentCategory-> {
        _id,
        title,
        "slug": slug.current
      }
    },
    brand-> {
      _id,
      name,
      logo {
        asset-> {
          url
        }
      }
    },
    gender,
    featured,
    "createdAt": store.createdAt
  }`;

  try {
    const collection = await sanityFetch<Collection | null>(collectionQuery, { slug });
    if (!collection) return null;

    const shopifyIdStr = collection.shopifyId
      ? collection.shopifyId.toString()
      : "";

    let products = await sanityFetch<CollectionProduct[]>(productsQuery, {
      collectionId: collection._id,
      shopifyIdStr: shopifyIdStr,
    });

    if ((!products || products.length === 0) && collection.shopifyId) {
      console.log(
        `⚠️ No products found for collection "${collection.title}" (Shopify ID: ${collection.shopifyId})`
      );
    }

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

    return {
      ...collection,
      products: products || [],
    };
  } catch (error) {
    console.error(`Error fetching collection ${slug}:`, error);
    return null;
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
    editorialImages[] {
      _key,
      image {
        asset-> {
          _id,
          url,
          metadata { lqip }
        },
        alt
      },
      caption
    },
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
  page: number
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
  page?: number
): Promise<SanityProduct[] | PaginatedCollectionProducts> {
  const shopifyIdStr = shopifyId ? shopifyId.toString() : "";

  const baseFilter = `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))]`;

  const productProjection = `{
    _id,
    "title": coalesce(title, store.title),
    "handle": coalesce(shopifyHandle, store.slug.current),
    "description": store.descriptionHtml,
    "vendor": store.vendor,
    "productType": store.productType,
    "tags": store.tags,
    "priceRange": {
      "minVariantPrice": store.priceRange.minVariantPrice,
      "maxVariantPrice": store.priceRange.maxVariantPrice
    },
    "mainImage": {
      "url": store.previewImageUrl,
      "alt": store.title,
      "lqip": mainImage.asset->metadata.lqip
    },
    "gallery": gallery[] {
      "url": asset->url,
      alt,
      "lqip": asset->metadata.lqip
    } | order(_key asc),
    "options": store.options,
    "variants": store.variants[]-> {
      "id": store.gid,
      "title": store.title,
      "sku": store.sku,
      "price": store.price,
      "compareAtPrice": store.compareAtPrice,
      "available": store.inventory.isAvailable,
      "selectedOptions": [
        select(store.option1 != null => {"name": "Size", "value": store.option1}),
        select(store.option2 != null => {"name": "Color", "value": store.option2}),
        select(store.option3 != null => {"name": "Material", "value": store.option3})
      ]
    },
    category-> {
      _id,
      title,
      "slug": slug.current,
      categoryType,
      parentCategory-> {
        _id,
        title,
        "slug": slug.current
      }
    },
    brand-> {
      _id,
      name,
      logo {
        asset-> {
          url
        }
      }
    },
    gender,
    featured,
    "createdAt": store.createdAt
  }`;

  // Helper to sort products by curated order then createdAt
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

  // If page is provided, use pagination
  if (page !== undefined) {
    const countQuery = `count(${baseFilter})`;
    const productsQuery = `${baseFilter}${productProjection}`;

    try {
      const [totalCount, allProducts] = await Promise.all([
        sanityFetch<number>(countQuery, { collectionId, shopifyIdStr }),
        sanityFetch<CollectionProduct[]>(productsQuery, { collectionId, shopifyIdStr }),
      ]);

      // Sort all products first (curated order matters)
      const sortedProducts = sortProducts(allProducts);

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
  const productsQuery = `${baseFilter}${productProjection}`;

  try {
    let products = await sanityFetch<CollectionProduct[]>(productsQuery, {
      collectionId,
      shopifyIdStr,
    });

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

  const productsQuery = `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))]{
    _id,
    "title": coalesce(title, store.title),
    "handle": coalesce(shopifyHandle, store.slug.current),
    "description": store.descriptionHtml,
    "vendor": store.vendor,
    "productType": store.productType,
    "tags": store.tags,
    "priceRange": {
      "minVariantPrice": store.priceRange.minVariantPrice,
      "maxVariantPrice": store.priceRange.maxVariantPrice
    },
    "mainImage": {
      "url": store.previewImageUrl,
      "alt": store.title,
      "lqip": mainImage.asset->metadata.lqip
    },
    "gallery": gallery[] {
      "url": asset->url,
      "alt": alt,
      "lqip": asset->metadata.lqip
    },
    "options": store.options,
    "variants": store.variants[]-> {
      "id": store.gid,
      "title": store.title,
      "sku": store.sku,
      "price": store.price,
      "compareAtPrice": store.compareAtPrice,
      "available": store.inventory.isAvailable,
      "selectedOptions": [
        select(store.option1 != null => {"name": "Size", "value": store.option1}),
        select(store.option2 != null => {"name": "Color", "value": store.option2}),
        select(store.option3 != null => {"name": "Material", "value": store.option3})
      ]
    },
    category-> {
      _id,
      title,
      "slug": slug.current,
      categoryType,
      parentCategory-> {
        _id,
        title,
        "slug": slug.current
      }
    },
    brand-> {
      _id,
      name,
      "slug": slug.current,
      logo {
        asset-> {
          url
        }
      }
    },
    gender,
    featured,
    "createdAt": store.createdAt
  }`;

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
