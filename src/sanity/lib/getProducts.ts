import { sanityFetch } from "@/sanity/lib/client";
import type { SanityProduct } from "@/types/sanityProduct";
import {
  BASE_PRODUCT_PROJECTION,
  FULL_PRODUCT_PROJECTION,
  buildLimitClause,
  buildPaginationSlice,
  mapGenderValue,
  PRODUCTS_PER_PAGE,
} from "./groqUtils";

// Pagination result type
export interface PaginatedProducts {
  products: SanityProduct[];
  totalCount: number;
  totalPages: number;
}

export async function getSanityProductByHandle(
  handle: string
): Promise<SanityProduct | null> {
  const query = `*[_type == "product" && (shopifyHandle == $handle || store.slug.current == $handle)][0] {
    ${FULL_PRODUCT_PROJECTION},
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

export async function getAllProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product"] {
    ${BASE_PRODUCT_PROJECTION}
  }`;

  try {
    return await sanityFetch<SanityProduct[]>(query);
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

// Filter options for brand/collection queries
export interface ProductFilters {
  sizes?: string[];
  categories?: string[];
  sort?: "title" | "price-asc" | "price-desc" | "newest";
}

// Overload: with page parameter returns paginated result
export async function getProductsByBrand(
  brandSlug: string,
  limit: number | undefined,
  gender: string | undefined,
  page: number,
  filters?: ProductFilters
): Promise<PaginatedProducts>;
// Overload: without page parameter returns array
export async function getProductsByBrand(
  brandSlug: string,
  limit?: number,
  gender?: string
): Promise<SanityProduct[]>;
// Implementation
export async function getProductsByBrand(
  brandSlug: string,
  limit?: number,
  gender?: string,
  page?: number,
  filters?: ProductFilters
): Promise<SanityProduct[] | PaginatedProducts> {
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };

  const dbGender = gender ? genderMap[gender] || gender : null;

  const genderFilter = dbGender
    ? `&& (gender == $dbGender || gender == "unisex")`
    : "";

  // Build dynamic filter conditions
  let sizeFilter = "";
  let categoryFilter = "";

  if (filters?.sizes && filters.sizes.length > 0) {
    // Filter by variant sizes - check if any variant has a matching size
    sizeFilter = `&& count(store.variants[@->store.option1 in $filterSizes || @->store.option2 in $filterSizes]) > 0`;
  }

  if (filters?.categories && filters.categories.length > 0) {
    // Filter by category slug (any level)
    categoryFilter = `&& (
      category->slug.current in $filterCategories ||
      category->parentCategory->slug.current in $filterCategories ||
      category->parentCategory->parentCategory->slug.current in $filterCategories
    )`;
  }

  // Build sort order
  let orderClause = "| order(title asc)";
  if (filters?.sort) {
    switch (filters.sort) {
      case "price-asc":
        orderClause = "| order(store.priceRange.minVariantPrice asc)";
        break;
      case "price-desc":
        orderClause = "| order(store.priceRange.minVariantPrice desc)";
        break;
      case "newest":
        orderClause = "| order(coalesce(store.createdAt, _createdAt) desc)";
        break;
      default:
        orderClause = "| order(title asc)";
    }
  }

  const baseFilter = `*[_type == "product" && (brand->slug.current == $brandSlug || lower(brand->slug.current) == lower($brandSlug))${genderFilter}${sizeFilter}${categoryFilter}]`;

  // If page is provided, use pagination; otherwise use limit (backwards compatible)
  if (page !== undefined) {
    const countQuery = `count(${baseFilter})`;
    const productsQuery = `${baseFilter} {
      ${BASE_PRODUCT_PROJECTION},
      brand-> {
        _id,
        name,
        description,
        slug {
          current
        }
      }
    } ${orderClause}${buildPaginationSlice(page)}`;

    try {
      // Build params object with all needed values
      const params: Record<string, unknown> = { brandSlug };
      if (dbGender) params.dbGender = dbGender;
      if (filters?.sizes?.length) params.filterSizes = filters.sizes;
      if (filters?.categories?.length) params.filterCategories = filters.categories;

      const [totalCount, products] = await Promise.all([
        sanityFetch<number>(countQuery, params),
        sanityFetch<SanityProduct[]>(productsQuery, params),
      ]);

      return {
        products,
        totalCount,
        totalPages: Math.ceil(totalCount / PRODUCTS_PER_PAGE),
      };
    } catch (error) {
      console.error(`Error fetching paginated products for brand ${brandSlug}:`, error);
      return { products: [], totalCount: 0, totalPages: 0 };
    }
  }

  // Legacy: no pagination, use limit
  const query = `${baseFilter} {
    ${BASE_PRODUCT_PROJECTION},
    brand-> {
      _id,
      name,
      description,
      slug {
        current
      }
    }
  } ${orderClause}${buildLimitClause(limit)}`;

  try {
    const params = dbGender ? { brandSlug, dbGender } : { brandSlug };
    return await sanityFetch<SanityProduct[]>(query, params);
  } catch (error) {
    console.error(`Error fetching products for brand ${brandSlug}:`, error);
    return [];
  }
}

export async function getProductsByGender(
  gender: string,
  limit?: number
): Promise<SanityProduct[]> {
  const dbGender = mapGenderValue(gender);

  const query = `*[_type == "product" && (gender == $gender || gender == "unisex")] {
    ${BASE_PRODUCT_PROJECTION}
  } | order(title asc)${buildLimitClause(limit)}`;

  try {
    return await sanityFetch<SanityProduct[]>(query, { gender: dbGender });
  } catch (error) {
    console.error(`Error fetching products for gender ${gender}:`, error);
    return [];
  }
}

export async function getProductsByPath(
  gender: string,
  categoryType: string,
  categorySlug: string,
  limit?: number
): Promise<SanityProduct[]> {
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
    ${BASE_PRODUCT_PROJECTION}
  } | order(title asc)${buildLimitClause(limit)}`
      : `*[_type == "product" && 
        (gender == $gender || gender == "unisex") && 
        category->categoryType == $categoryType && 
        category->slug.current == $categorySlug
      ] {
    ${BASE_PRODUCT_PROJECTION}
  } | order(title asc)${buildLimitClause(limit)}`;

  try {
    return await sanityFetch<SanityProduct[]>(query, {
      gender: dbGender,
      categoryType,
      categorySlug,
    });
  } catch (error) {
    console.error(
      `Error fetching products for path ${gender}/${categoryType}/${categorySlug}:`,
      error
    );
    return [];
  }
}

export async function getProductsBySubcategoryIncludingSubSubcategories(
  gender: string,
  mainCategorySlug: string,
  subcategorySlug: string,
  limit?: number
): Promise<SanityProduct[]> {
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
    ${BASE_PRODUCT_PROJECTION},
    category-> {
      _id,
      title,
      "slug": slug.current,
      categoryType,
      parentCategory-> {
        _id,
        title,
        "slug": slug.current,
        parentCategory-> {
          _id,
          title,
          "slug": slug.current,
          parentCategory-> {
            _id,
            title,
            "slug": slug.current
          }
        }
      }
    }
  } | order(title asc)${buildLimitClause(limit)}`;

  try {
    return await sanityFetch<SanityProduct[]>(query, {
      gender: dbGender,
      mainCategorySlug,
      subcategorySlug,
    });
  } catch (error) {
    console.error(
      `Error fetching products for subcategory ${subcategorySlug}:`,
      error
    );
    return [];
  }
}

export async function getProductsByPath3Level(
  gender: string,
  mainCategorySlug: string,
  subcategorySlug: string,
  subsubcategorySlug: string,
  limit?: number
): Promise<SanityProduct[]> {
  const dbGender = mapGenderValue(gender);

  const query = `*[_type == "product" && 
    (gender == $gender || gender == "unisex") && 
    category->categoryType == "specific" && 
    category->slug.current == $subsubcategorySlug &&
    category->parentCategory->slug.current == $subcategorySlug &&
    category->parentCategory->parentCategory->slug.current == $mainCategorySlug
  ] {
    ${BASE_PRODUCT_PROJECTION}
  } | order(title asc)${buildLimitClause(limit)}`;

  try {
    return await sanityFetch<SanityProduct[]>(query, {
      gender: dbGender,
      mainCategorySlug,
      subcategorySlug,
      subsubcategorySlug,
    });
  } catch (error) {
    console.error(
      `Error fetching products for 3-level path ${gender}/${mainCategorySlug}/${subcategorySlug}/${subsubcategorySlug}:`,
      error
    );
    return [];
  }
}

export async function getProductsByIds(
  productIds: string[]
): Promise<SanityProduct[]> {
  if (productIds.length === 0) return [];

  const query = `*[_id in $productIds] {
    ${BASE_PRODUCT_PROJECTION},
    "brandRef": brand._ref
  }`;

  try {
    const products = await sanityFetch<SanityProduct[]>(query, { productIds });
    return products;
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    return [];
  }
}

// Available filter options for a brand
export interface BrandFilterOptions {
  sizes: string[];
  categories: { slug: string; title: string }[];
}

/**
 * Fetches available filter options for a brand's products.
 * Returns unique sizes and categories across all products.
 */
export async function getBrandFilterOptions(
  brandSlug: string,
  gender?: string
): Promise<BrandFilterOptions> {
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };

  const dbGender = gender ? genderMap[gender] || gender : null;
  const genderFilter = dbGender
    ? `&& (gender == $dbGender || gender == "unisex")`
    : "";

  const query = `{
    "sizes": array::unique(*[_type == "product" && (brand->slug.current == $brandSlug || lower(brand->slug.current) == lower($brandSlug))${genderFilter}].store.variants[]->store.option1),
    "categories": array::unique(*[_type == "product" && (brand->slug.current == $brandSlug || lower(brand->slug.current) == lower($brandSlug))${genderFilter}] {
      "slug": category->slug.current,
      "title": category->title
    })
  }`;

  try {
    const params: Record<string, unknown> = { brandSlug };
    if (dbGender) params.dbGender = dbGender;

    const result = await sanityFetch<{
      sizes: (string | null)[];
      categories: ({ slug: string; title: string } | null)[];
    }>(query, params);

    return {
      sizes: result.sizes.filter((s): s is string => s !== null),
      categories: result.categories.filter(
        (c): c is { slug: string; title: string } => c !== null && c.slug !== null
      ),
    };
  } catch (error) {
    console.error(`Error fetching filter options for brand ${brandSlug}:`, error);
    return { sizes: [], categories: [] };
  }
}

