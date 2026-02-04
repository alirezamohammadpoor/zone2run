// Shared GROQ utilities and common query patterns

// Search page size — used for server-side GROQ slicing in search queries
export const SEARCH_PAGE_SIZE = 28;

/**
 * Builds a pagination slice for GROQ queries (used by search)
 * @param page - 1-indexed page number
 * @param perPage - Number of items per page (default: SEARCH_PAGE_SIZE)
 * @returns GROQ slice string like "[0...28]" or "[28...56]"
 */
export function buildPaginationSlice(
  page: number,
  perPage: number = SEARCH_PAGE_SIZE,
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
  "barcode": store.barcode,
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
 * PDP (Product Detail Page) projection — full product data.
 * Used only by getProductByHandle() for the detail page.
 * Includes variants, options, description, tags, full category hierarchy, brand with logo.
 */
export const PDP_PRODUCT_PROJECTION =
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
"images": [{
  "url": coalesce(mainImage.asset->url, store.previewImageUrl),
  "alt": coalesce(mainImage.alt, store.title),
  "lqip": mainImage.asset->metadata.lqip
}] + coalesce(gallery[] {
  "url": asset->url,
  "alt": coalesce(alt, ^.title),
  "lqip": asset->metadata.lqip
}, []),
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
featured,
"_createdAt": coalesce(store.createdAt, _createdAt)`;

/**
 * PLP (Product Listing Page) projection — lean listing data.
 * Used by category, gender, brand, and collection pages.
 * Drops: variants (full), options, tags, description, productType, featured, brand logo, category nesting.
 * Keeps: full gallery (for card carousel), sizes (from variant option1), flat brand/category refs.
 */
export const PLP_PRODUCT_PROJECTION = `
_id,
"shopifyId": store.gid,
"title": coalesce(title, store.title),
"handle": coalesce(shopifyHandle, store.slug.current),
"vendor": store.vendor,
"priceRange": {
  "minVariantPrice": store.priceRange.minVariantPrice,
  "maxVariantPrice": store.priceRange.maxVariantPrice,
  "currencyCode": store.priceRange.currencyCode
},
"images": [{
  "url": coalesce(mainImage.asset->url, store.previewImageUrl),
  "alt": coalesce(mainImage.alt, store.title),
  "lqip": mainImage.asset->metadata.lqip
}] + coalesce(gallery[] {
  "url": asset->url,
  "alt": coalesce(alt, ^.title),
  "lqip": asset->metadata.lqip
}, []),
"sizes": store.variants[]->store.option1,
brand-> {
  name,
  "slug": slug.current
},
category-> {
  title,
  "slug": slug.current
},
gender,
"_createdAt": coalesce(store.createdAt, _createdAt)`;

/**
 * Card projection — minimal display-only data.
 * Used by related products, homepage modules, and carousels.
 * No sizes, category, gender, or sorting fields.
 */
export const CARD_PRODUCT_PROJECTION = `
_id,
"shopifyId": store.gid,
"title": coalesce(title, store.title),
"handle": coalesce(shopifyHandle, store.slug.current),
"vendor": store.vendor,
"priceRange": {
  "minVariantPrice": store.priceRange.minVariantPrice,
  "maxVariantPrice": store.priceRange.maxVariantPrice,
  "currencyCode": store.priceRange.currencyCode
},
"images": [{
  "url": coalesce(mainImage.asset->url, store.previewImageUrl),
  "alt": coalesce(mainImage.alt, store.title),
  "lqip": mainImage.asset->metadata.lqip
}] + coalesce(gallery[] {
  "url": asset->url,
  "alt": coalesce(alt, ^.title),
  "lqip": asset->metadata.lqip
}, []),
brand-> {
  name,
  "slug": slug.current
},
"sizes": store.variants[]->store.option1`;

/**
 * Hero image projection fragment (single image for LCP)
 */
export const HERO_IMAGE_PROJECTION = `heroImage {
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
}`;

/**
 * Editorial images projection fragment
 */
export const EDITORIAL_IMAGES_PROJECTION = `editorialImages[] {
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
}`;

/**
 * Menu image projection fragment
 */
export const MENU_IMAGE_PROJECTION = `menuImage {
  asset-> {
    _id,
    url,
    metadata { lqip }
  },
  alt
}`;

/**
 * Collection product projection — lean PLP shape using previewImageUrl.
 * Uses store.previewImageUrl for mainImage (skips mainImage asset resolution).
 * Drops: variants (full), options, tags, description, productType, featured, brand logo.
 */
export const COLLECTION_PRODUCT_PROJECTION = `{
  _id,
  "shopifyId": store.gid,
  "title": coalesce(title, store.title),
  "handle": coalesce(shopifyHandle, store.slug.current),
  "vendor": store.vendor,
  "priceRange": {
    "minVariantPrice": store.priceRange.minVariantPrice,
    "maxVariantPrice": store.priceRange.maxVariantPrice,
    "currencyCode": store.priceRange.currencyCode
  },
  "images": [{
    "url": store.previewImageUrl,
    "alt": store.title,
    "lqip": mainImage.asset->metadata.lqip
  }] + coalesce(gallery[] {
    "url": asset->url,
    "alt": coalesce(alt, ^.title),
    "lqip": asset->metadata.lqip
  }, []),
  "sizes": store.variants[]->store.option1,
  category-> {
    title,
    "slug": slug.current
  },
  brand-> {
    name,
    "slug": slug.current
  },
  gender,
  "_createdAt": coalesce(store.createdAt, _createdAt)
}`;
