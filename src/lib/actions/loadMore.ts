"use server";

import type { PLPProduct } from "@/types/plpProduct";
import {
  getProductsByGenderPaginated,
  getProductsByBrandPaginated,
  getProductsByPathPaginated,
  getProductsBySubcategoryPaginated,
  getProductsByPath3LevelPaginated,
} from "@/sanity/lib/getData";
import { getCollectionProductsPaginated } from "@/sanity/lib/getData";
import { PLP_PAGE_SIZE } from "@/sanity/lib/groqUtils";

/**
 * Discriminated union for identifying which PLP query to run.
 * Each variant carries the parameters needed for its specific query.
 */
export type PLPQueryType =
  | { type: "gender"; gender: string }
  | { type: "brand"; brandSlug: string; gender?: string }
  | { type: "category"; gender: string; categoryType: string; categorySlug: string }
  | { type: "subcategory"; gender: string; mainCategorySlug: string; subcategorySlug: string }
  | { type: "specific"; gender: string; mainCategorySlug: string; subcategorySlug: string; subsubcategorySlug: string }
  | { type: "collection"; collectionId: string; shopifyId?: number; curatedProductIds?: string[] };

/**
 * Server action: Load more products for any PLP page.
 * Called by ProductListing's "Load More" button.
 */
export async function loadMoreProducts(
  query: PLPQueryType,
  offset: number,
  country?: string,
): Promise<PLPProduct[]> {
  const pagination = { offset, limit: PLP_PAGE_SIZE };

  switch (query.type) {
    case "gender": {
      const result = await getProductsByGenderPaginated(
        query.gender,
        pagination,
        country,
      );
      return result.products;
    }
    case "brand": {
      const result = await getProductsByBrandPaginated(
        query.brandSlug,
        pagination,
        query.gender,
        country,
      );
      return result.products;
    }
    case "category": {
      const result = await getProductsByPathPaginated(
        query.gender,
        query.categoryType,
        query.categorySlug,
        pagination,
        country,
      );
      return result.products;
    }
    case "subcategory": {
      const result = await getProductsBySubcategoryPaginated(
        query.gender,
        query.mainCategorySlug,
        query.subcategorySlug,
        pagination,
        country,
      );
      return result.products;
    }
    case "specific": {
      const result = await getProductsByPath3LevelPaginated(
        query.gender,
        query.mainCategorySlug,
        query.subcategorySlug,
        query.subsubcategorySlug,
        pagination,
        country,
      );
      return result.products;
    }
    case "collection": {
      const curatedProducts = query.curatedProductIds?.map((id) => ({ _id: id }));
      const result = await getCollectionProductsPaginated(
        query.collectionId,
        query.shopifyId,
        curatedProducts,
        pagination,
        country,
      );
      return result.products;
    }
  }
}
