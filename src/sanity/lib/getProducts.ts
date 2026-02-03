import { sanityFetch } from "@/sanity/lib/client";
import type { SanityProduct } from "@/types/sanityProduct";
import type { PLPProduct } from "@/types/plpProduct";
import type { CardProduct } from "@/types/cardProduct";
import {
  PDP_PRODUCT_PROJECTION,
  PLP_PRODUCT_PROJECTION,
  CARD_PRODUCT_PROJECTION,
  PLP_PAGE_SIZE,
  buildLimitClause,
  mapGenderValue,
} from "./groqUtils";
import { enrichWithLocalePrices } from "@/lib/locale/enrichPrices";
import { deduplicateSizes, type RawProductWithSizes } from "./deduplicateSizes";

/** Pagination options for PLP queries */
export interface PLPPagination {
  offset?: number;
  limit?: number;
}

/** Result with products + total count for server-side pagination */
export interface PaginatedPLPResult {
  products: PLPProduct[];
  totalCount: number;
}

/** Build GROQ slice from pagination options */
function buildSlice(pagination?: PLPPagination): string {
  if (!pagination) return "";
  const offset = pagination.offset ?? 0;
  const limit = pagination.limit ?? PLP_PAGE_SIZE;
  return `[${offset}...${offset + limit}]`;
}

// ---------------------------------------------------------------------------
// PDP — Full product detail
// ---------------------------------------------------------------------------

export async function getSanityProductByHandle(
  handle: string,
): Promise<SanityProduct | null> {
  const query = `*[_type == "product" && (shopifyHandle == $handle || store.slug.current == $handle)][0] {
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
  }`;

  try {
    return await sanityFetch<SanityProduct | null>(query, { handle });
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
  const query = `*[_type == "product"] {
    ${PLP_PRODUCT_PROJECTION}
  }`;

  try {
    const raw = await sanityFetch<RawProductWithSizes[]>(query);
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

  const query = `${baseFilter} {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`;

  try {
    const params = dbGender ? { brandSlug, dbGender } : { brandSlug };
    const raw = await sanityFetch<RawProductWithSizes[]>(query, params);
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

  const query = `*[_type == "product" && (gender == $gender || gender == "unisex")] {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`;

  try {
    const raw = await sanityFetch<RawProductWithSizes[]>(query, {
      gender: dbGender,
    });
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
      ? `*[_type == "product" &&
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
  } | order(_createdAt desc)${buildLimitClause(limit)}`
      : `*[_type == "product" &&
        (gender == $gender || gender == "unisex") &&
        category->categoryType == $categoryType &&
        category->slug.current == $categorySlug
      ] {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`;

  try {
    const raw = await sanityFetch<RawProductWithSizes[]>(query, {
      gender: dbGender,
      categoryType,
      categorySlug,
    });
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

  const query = `*[_type == "product" &&
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
  } | order(_createdAt desc)${buildLimitClause(limit)}`;

  try {
    const raw = await sanityFetch<RawProductWithSizes[]>(query, {
      gender: dbGender,
      mainCategorySlug,
      subcategorySlug,
    });
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

  const query = `*[_type == "product" &&
    (gender == $gender || gender == "unisex") &&
    category->categoryType == "specific" &&
    category->slug.current == $subsubcategorySlug &&
    category->parentCategory->slug.current == $subcategorySlug &&
    category->parentCategory->parentCategory->slug.current == $mainCategorySlug
  ] {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildLimitClause(limit)}`;

  try {
    const raw = await sanityFetch<RawProductWithSizes[]>(query, {
      gender: dbGender,
      mainCategorySlug,
      subcategorySlug,
      subsubcategorySlug,
    });
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

  const query = `*[_id in $productIds] {
    ${CARD_PRODUCT_PROJECTION}
  }`;

  try {
    const products = await sanityFetch<CardProduct[]>(query, { productIds });
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
  const query = `*[_type == "product" && brand->slug.current == $brandSlug && _id != $excludeId] {
    ${CARD_PRODUCT_PROJECTION}
  } | order(_createdAt desc)[0...${limit}]`;

  try {
    const products = await sanityFetch<CardProduct[]>(query, { brandSlug, excludeId });
    return country ? enrichWithLocalePrices(products, country) : products;
  } catch (error) {
    console.error(`Error fetching related products for brand ${brandSlug}:`, error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Paginated PLP queries — server-side pagination with count
// ---------------------------------------------------------------------------

/** Gender page with pagination (e.g., /mens, /womens) */
export async function getProductsByGenderPaginated(
  gender: string,
  pagination: PLPPagination = { offset: 0, limit: PLP_PAGE_SIZE },
  country?: string,
): Promise<PaginatedPLPResult> {
  const dbGender = mapGenderValue(gender);
  const filter = `*[_type == "product" && (gender == $gender || gender == "unisex")]`;

  const productsQuery = `${filter} {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildSlice(pagination)}`;
  const countQuery = `count(${filter})`;

  try {
    const [raw, totalCount] = await Promise.all([
      sanityFetch<RawProductWithSizes[]>(productsQuery, { gender: dbGender }),
      sanityFetch<number>(countQuery, { gender: dbGender }),
    ]);
    const products = deduplicateSizes(raw);
    return {
      products: country ? await enrichWithLocalePrices(products, country) : products,
      totalCount,
    };
  } catch (error) {
    console.error(`Error fetching paginated products for gender ${gender}:`, error);
    return { products: [], totalCount: 0 };
  }
}

/** Brand page with pagination (e.g., /brands/nike) */
export async function getProductsByBrandPaginated(
  brandSlug: string,
  pagination: PLPPagination = { offset: 0, limit: PLP_PAGE_SIZE },
  gender?: string,
  country?: string,
): Promise<PaginatedPLPResult> {
  const dbGender = gender ? mapGenderValue(gender) : null;
  const genderFilter = dbGender
    ? `&& (gender == $dbGender || gender == "unisex")`
    : "";
  const filter = `*[_type == "product" && (brand->slug.current == $brandSlug || lower(brand->slug.current) == lower($brandSlug))${genderFilter}]`;

  const productsQuery = `${filter} {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildSlice(pagination)}`;
  const countQuery = `count(${filter})`;

  try {
    const params = dbGender ? { brandSlug, dbGender } : { brandSlug };
    const [raw, totalCount] = await Promise.all([
      sanityFetch<RawProductWithSizes[]>(productsQuery, params),
      sanityFetch<number>(countQuery, params),
    ]);
    const products = deduplicateSizes(raw);
    return {
      products: country ? await enrichWithLocalePrices(products, country) : products,
      totalCount,
    };
  } catch (error) {
    console.error(`Error fetching paginated products for brand ${brandSlug}:`, error);
    return { products: [], totalCount: 0 };
  }
}

/** Main category page with pagination (e.g., /mens/clothing) */
export async function getProductsByPathPaginated(
  gender: string,
  categoryType: string,
  categorySlug: string,
  pagination: PLPPagination = { offset: 0, limit: PLP_PAGE_SIZE },
  country?: string,
): Promise<PaginatedPLPResult> {
  const dbGender = mapGenderValue(gender);

  const filter =
    categoryType === "main"
      ? `*[_type == "product" &&
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
      ]`
      : `*[_type == "product" &&
        (gender == $gender || gender == "unisex") &&
        category->categoryType == $categoryType &&
        category->slug.current == $categorySlug
      ]`;

  const productsQuery = `${filter} {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildSlice(pagination)}`;
  const countQuery = `count(${filter})`;

  try {
    const params = { gender: dbGender, categoryType, categorySlug };
    const [raw, totalCount] = await Promise.all([
      sanityFetch<RawProductWithSizes[]>(productsQuery, params),
      sanityFetch<number>(countQuery, params),
    ]);
    const products = deduplicateSizes(raw);
    return {
      products: country ? await enrichWithLocalePrices(products, country) : products,
      totalCount,
    };
  } catch (error) {
    console.error(`Error fetching paginated products for path ${gender}/${categoryType}/${categorySlug}:`, error);
    return { products: [], totalCount: 0 };
  }
}

/** Subcategory page with pagination (e.g., /mens/clothing/tops) */
export async function getProductsBySubcategoryPaginated(
  gender: string,
  mainCategorySlug: string,
  subcategorySlug: string,
  pagination: PLPPagination = { offset: 0, limit: PLP_PAGE_SIZE },
  country?: string,
): Promise<PaginatedPLPResult> {
  const dbGender = mapGenderValue(gender);

  const filter = `*[_type == "product" &&
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
  ]`;

  const productsQuery = `${filter} {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildSlice(pagination)}`;
  const countQuery = `count(${filter})`;

  try {
    const params = { gender: dbGender, mainCategorySlug, subcategorySlug };
    const [raw, totalCount] = await Promise.all([
      sanityFetch<RawProductWithSizes[]>(productsQuery, params),
      sanityFetch<number>(countQuery, params),
    ]);
    const products = deduplicateSizes(raw);
    return {
      products: country ? await enrichWithLocalePrices(products, country) : products,
      totalCount,
    };
  } catch (error) {
    console.error(`Error fetching paginated products for subcategory ${subcategorySlug}:`, error);
    return { products: [], totalCount: 0 };
  }
}

/** 3-level specific category with pagination (e.g., /mens/clothing/tops/t-shirts) */
export async function getProductsByPath3LevelPaginated(
  gender: string,
  mainCategorySlug: string,
  subcategorySlug: string,
  subsubcategorySlug: string,
  pagination: PLPPagination = { offset: 0, limit: PLP_PAGE_SIZE },
  country?: string,
): Promise<PaginatedPLPResult> {
  const dbGender = mapGenderValue(gender);

  const filter = `*[_type == "product" &&
    (gender == $gender || gender == "unisex") &&
    category->categoryType == "specific" &&
    category->slug.current == $subsubcategorySlug &&
    category->parentCategory->slug.current == $subcategorySlug &&
    category->parentCategory->parentCategory->slug.current == $mainCategorySlug
  ]`;

  const productsQuery = `${filter} {
    ${PLP_PRODUCT_PROJECTION}
  } | order(_createdAt desc)${buildSlice(pagination)}`;
  const countQuery = `count(${filter})`;

  try {
    const params = { gender: dbGender, mainCategorySlug, subcategorySlug, subsubcategorySlug };
    const [raw, totalCount] = await Promise.all([
      sanityFetch<RawProductWithSizes[]>(productsQuery, params),
      sanityFetch<number>(countQuery, params),
    ]);
    const products = deduplicateSizes(raw);
    return {
      products: country ? await enrichWithLocalePrices(products, country) : products,
      totalCount,
    };
  } catch (error) {
    console.error(`Error fetching paginated 3-level products:`, error);
    return { products: [], totalCount: 0 };
  }
}
