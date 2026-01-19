// Shared GROQ utilities and common query patterns

// Pagination constants
export const PRODUCTS_PER_PAGE = 16;

/**
 * Builds a pagination slice for GROQ queries
 * @param page - 1-indexed page number
 * @param perPage - Number of items per page (default: PRODUCTS_PER_PAGE)
 * @returns GROQ slice string like "[0...12]" or "[12...24]"
 */
export function buildPaginationSlice(
  page: number,
  perPage: number = PRODUCTS_PER_PAGE,
): string {
  const offset = (page - 1) * perPage;
  return `[${offset}...${offset + perPage}]`;
}

/**
 * Maps frontend gender values to database values
 */
export function mapGenderValue(gender: string): string {
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };
  return genderMap[gender] || gender;
}

/**
 * Builds a gender filter clause for GROQ queries
 * Includes unisex products when a specific gender is provided
 */
export function buildGenderFilter(gender?: string | null): string {
  if (!gender) return "";
  const dbGender = mapGenderValue(gender);
  return `&& (gender == $dbGender || gender == "unisex")`;
}

/**
 * Builds a limit clause for GROQ queries
 */
export function buildLimitClause(limit?: number): string {
  return limit ? `[0...${limit}]` : "";
}

/**
 * Product variants projection fragment
 */
export const PRODUCT_VARIANTS_PROJECTION = `store.variants[]-> {
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
}`;

/**
 * Category reference projection fragment (with nested parentCategory)
 */
export const CATEGORY_REFERENCE_PROJECTION = `category-> {
  _id,
  title,
  "slug": slug.current,
  categoryType,
  parentCategory-> {
    _id,
    title,
    "slug": slug.current,
    categoryType,
    parentCategory-> {
      _id,
      title,
      "slug": slug.current
    }
  }
}`;

/**
 * Brand reference projection fragment
 */
export const BRAND_REFERENCE_PROJECTION = `brand-> {
  _id,
  name,
  "slug": slug.current,
  logo {
    asset-> {
      url
    }
  }
}`;

/**
 * Base product projection fragment (common fields used across product queries)
 */
export const BASE_PRODUCT_PROJECTION =
  `_id,
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
  "url": coalesce(mainImage.asset->url, store.previewImageUrl),
  "alt": coalesce(mainImage.alt, store.title)
},
"gallery": gallery[] {
  "url": asset->url,
  alt,
  "lqip": asset->metadata.lqip
} | order(_key asc),
"options": store.options,
"variants": ` +
  PRODUCT_VARIANTS_PROJECTION +
  `,
` +
  CATEGORY_REFERENCE_PROJECTION +
  `,
` +
  BRAND_REFERENCE_PROJECTION +
  `,
gender,
featured`;

/**
 * Full product projection (same as BASE now that gallery is included)
 * @deprecated Use BASE_PRODUCT_PROJECTION instead - gallery is now included by default
 */
export const FULL_PRODUCT_PROJECTION = BASE_PRODUCT_PROJECTION;
