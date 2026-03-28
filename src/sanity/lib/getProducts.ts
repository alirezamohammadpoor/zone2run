import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import type { SanityProduct } from "@/types/sanityProduct";
import type { PLPProduct } from "@/types/plpProduct";
import type { CardProduct } from "@/types/cardProduct";
import {
  PDP_PRODUCT_PROJECTION,
  PLP_PRODUCT_PROJECTION,
  CARD_PRODUCT_PROJECTION,
  buildLimitClause,
  mapGenderValue,
} from "./groqUtils";
import { enrichWithLocalePrices } from "@/lib/locale/enrichPrices";
import { deduplicateSizes, type RawProductWithSizes } from "./deduplicateSizes";

// ---------------------------------------------------------------------------
// PDP — Full product detail
// ---------------------------------------------------------------------------

export async function getSanityProductByHandle(
  handle: string,
): Promise<SanityProduct | null> {
  const query = defineQuery(`*[_type == "product" && (shopifyHandle == $handle || store.slug.current == $handle)][0] {
    ${PDP_PRODUCT_PROJECTION},
    "colorVariants": colorVariants[]-> {
      _id,
      "title": coalesce(title, store.title),
      "handle": coalesce(shopifyHandle, store.slug.current),
      "mainImage": {
        "url": coalesce(mainImage.asset->url, store.previewImageUrl),
        "alt": coalesce(mainImage.alt, store.title)
      }
    },
    editorialImages[] {
      _key,
      image {
        asset-> {
          _id,
          url
        },
        alt
      },
      caption
    }
  }`);

  try {
    const { data } = await sanityFetch({ query, params: { handle } });
    return data as SanityProduct | null;
  } catch (error) {
    console.error("Error fetching Sanity product by handle:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// PLP — Lean listing data (for category, gender, brand pages)
// ---------------------------------------------------------------------------

export async function getAllProducts(
  country?: string,
): Promise<PLPProduct[]> {
  const query = defineQuery(`*[_type == "product"] {
    ${PLP_PRODUCT_PROJECTION}
  }`);

  try {
    const { data } = await sanityFetch({ query });
    const raw = data as RawProductWithSizes[];
    const products = deduplicateSizes(raw);
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

export async function getProductsByBrand(
  brandSlug: string,
  limit?: number,
  gender?: string,
  country?: string,
): Promise<PLPProduct[]> {
  const dbGender = gender ? mapGenderValue(gender) : null;

  const genderFilter = dbGender
    ? `&& (gender == $dbGender || gender == "unisex")`
    : "";

  const baseFilter = `*[_type == "product" && (brand->slug.current == $brandSlug || lower(brand->slug.current) == lower($brandSlug))${genderFilter}]`;

  const query = defineQuery(`${baseFilter} {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`);

  try {
    const params = dbGender ? { brandSlug, dbGender } : { brandSlug };
    const { data } = await sanityFetch({ query, params });
    const raw = data as RawProductWithSizes[];
    const products = deduplicateSizes(raw);
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error(`Error fetching products for brand ${brandSlug}:`, error);
    return [];
  }
}

export async function getProductsByGender(
  gender: string,
  limit?: number,
  country?: string,
): Promise<PLPProduct[]> {
  const dbGender = mapGenderValue(gender);

  const query = defineQuery(`*[_type == "product" && (gender == $gender || gender == "unisex")] {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`);

  try {
    const { data } = await sanityFetch({ query, params: { gender: dbGender } });
    const raw = data as RawProductWithSizes[];
    const products = deduplicateSizes(raw);
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error(`Error fetching products for gender ${gender}:`, error);
    return [];
  }
}

export async function getProductsByPath(
  gender: string,
  categoryType: string,
  categorySlug: string,
  limit?: number,
  country?: string,
): Promise<PLPProduct[]> {
  const dbGender = mapGenderValue(gender);

  const query =
    categoryType === "main"
      ? defineQuery(`*[_type == "product" &&
        (gender == $gender || gender == "unisex") &&
        (
          (category->categoryType == "main" &&
           category->slug.current == $categorySlug)
          ||
          (category->categoryType == "subcategory" &&
           category->parentCategory->slug.current == $categorySlug)
          ||
          (category->categoryType == "specific" &&
           category->parentCategory->parentCategory->slug.current == $categorySlug)
        )
      ] {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`)
      : defineQuery(`*[_type == "product" &&
        (gender == $gender || gender == "unisex") &&
        category->categoryType == $categoryType &&
        category->slug.current == $categorySlug
      ] {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`);

  try {
    const { data } = await sanityFetch({ query, params: {
      gender: dbGender,
      categoryType,
      categorySlug,
    } });
    const raw = data as RawProductWithSizes[];
    const products = deduplicateSizes(raw);
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error(
      `Error fetching products for path ${gender}/${categoryType}/${categorySlug}:`,
      error,
    );
    return [];
  }
}

export async function getProductsBySubcategoryIncludingSubSubcategories(
  gender: string,
  mainCategorySlug: string,
  subcategorySlug: string,
  limit?: number,
  country?: string,
): Promise<PLPProduct[]> {
  const dbGender = mapGenderValue(gender);

  const query = defineQuery(`*[_type == "product" &&
    (gender == $gender || gender == "unisex") &&
    (
      (category->categoryType == "subcategory" &&
       category->slug.current == $subcategorySlug &&
       category->parentCategory->slug.current == $mainCategorySlug)
      ||
      (category->categoryType == "specific" &&
       category->parentCategory->slug.current == $subcategorySlug &&
       category->parentCategory->parentCategory->slug.current == $mainCategorySlug)
    )
  ] {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`);

  try {
    const { data } = await sanityFetch({ query, params: {
      gender: dbGender,
      mainCategorySlug,
      subcategorySlug,
    } });
    const raw = data as RawProductWithSizes[];
    const products = deduplicateSizes(raw);
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error(
      `Error fetching products for subcategory ${subcategorySlug}:`,
      error,
    );
    return [];
  }
}

export async function getProductsByPath3Level(
  gender: string,
  mainCategorySlug: string,
  subcategorySlug: string,
  subsubcategorySlug: string,
  limit?: number,
  country?: string,
): Promise<PLPProduct[]> {
  const dbGender = mapGenderValue(gender);

  const query = defineQuery(`*[_type == "product" &&
    (gender == $gender || gender == "unisex") &&
    category->categoryType == "specific" &&
    category->slug.current == $subsubcategorySlug &&
    category->parentCategory->slug.current == $subcategorySlug &&
    category->parentCategory->parentCategory->slug.current == $mainCategorySlug
  ] {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`);

  try {
    const { data } = await sanityFetch({ query, params: {
      gender: dbGender,
      mainCategorySlug,
      subcategorySlug,
      subsubcategorySlug,
    } });
    const raw = data as RawProductWithSizes[];
    const products = deduplicateSizes(raw);
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error(
      `Error fetching products for 3-level path ${gender}/${mainCategorySlug}/${subcategorySlug}/${subsubcategorySlug}:`,
      error,
    );
    return [];
  }
}

// ---------------------------------------------------------------------------
// Card — Minimal display data (for homepage, related products, carousels)
// ---------------------------------------------------------------------------

export async function getProductsByIds(
  productIds: string[],
  country?: string,
): Promise<CardProduct[]> {
  if (productIds.length === 0) return [];

  const query = defineQuery(`*[_id in $productIds] {
    ${CARD_PRODUCT_PROJECTION}
  }`);

  try {
    const { data } = await sanityFetch({ query, params: { productIds } });
    const products = data as CardProduct[];
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    return [];
  }
}

/**
 * Fetch related products for PDP (by brand, excluding current product).
 * Returns CardProduct[] — minimal display shape for carousels.
 */
export async function getRelatedProducts(
  brandSlug: string,
  excludeId: string,
  limit: number = 12,
  country?: string,
): Promise<CardProduct[]> {
  const query = defineQuery(`*[_type == "product" && brand->slug.current == $brandSlug && _id != $excludeId] {
    ${CARD_PRODUCT_PROJECTION}
  } | order(_createdAt desc)[0...${limit}]`);

  try {
    const { data } = await sanityFetch({ query, params: { brandSlug, excludeId } });
    const products = data as CardProduct[];
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error(`Error fetching related products for brand ${brandSlug}:`, error);
    return [];
  }
}
