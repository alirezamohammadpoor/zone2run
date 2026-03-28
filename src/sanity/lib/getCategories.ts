import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { mapGenderValue } from "./groqUtils";
import type { MenuData, SubcategoryMenuItem } from "@/types/menu";

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  productCount?: number;
  featured?: boolean;
  sortOrder?: number;
  categoryType?: string;
  parentCategory?: {
    _id: string;
    title: string;
    slug: { current: string };
  };
}

export async function getAllMainCategories() {
  const query = defineQuery(`*[_type == "category" && categoryType == "main"] {
    _id,
    title,
    slug {
      current
    },
    description,
    "productCount": count(*[_type == "product" && (
      category->parentCategory._ref == ^._id ||
      category->parentCategory->parentCategory._ref == ^._id
    )]),
    featured,
    sortOrder
  } | order(sortOrder asc, title asc)`);

  try {
    const { data } = await sanityFetch({ query });
    return data as Category[];
  } catch (error) {
    console.error("Error fetching all main categories:", error);
    return [];
  }
}

export async function getSubSubcategoriesByParentAndGender(
  parentSlug: string,
  gender: string
) {
  const dbGender = mapGenderValue(gender);

  const query = defineQuery(`*[_type == "category" &&
    categoryType == "specific" &&
    parentCategory->slug.current == $parentSlug
  ] {
    _id,
    title,
    slug {
      current
    },
    description,
    "productCount": count(*[_type == "product" && references(^._id) && (gender == $gender || gender == "unisex")]),
    sortOrder,
    parentCategory->{
      _id,
      title,
      slug {
        current
      }
    }
  } | order(sortOrder asc, title asc)`);

  try {
    const { data } = await sanityFetch({ query, params: { parentSlug, gender: dbGender } });
    return data as Category[];
  } catch (error) {
    console.error(
      `Error fetching sub-subcategories for parent ${parentSlug} and gender ${gender}:`,
      error
    );
    return [];
  }
}

export async function getSubcategoriesByParentAndGender(
  parentSlug: string,
  gender: string
) {
  const dbGender = mapGenderValue(gender);

  const query = defineQuery(`*[_type == "category" &&
    categoryType == "subcategory" &&
    parentCategory->slug.current == $parentSlug
  ] {
    _id,
    title,
    slug {
      current
    },
    categoryType,
    parentCategory-> {
      title,
      slug {
        current
      }
    }
  } | order(title asc)`);

  try {
    const { data } = await sanityFetch({ query, params: { parentSlug, gender: dbGender } });
    return data as Category[];
  } catch (error) {
    console.error(
      `Error fetching subcategories for ${parentSlug} and ${gender}:`,
      error
    );
    return [];
  }
}

/**
 * Fetches the entire category hierarchy for a gender in ONE query.
 * Returns MenuData format: { [mainCategorySlug]: SubcategoryMenuItem[] }
 *
 * This replaces 20+ sequential queries with 1 query per gender.
 */
export async function getCategoryHierarchyForGender(
  gender: string
): Promise<{ [mainCategorySlug: string]: SubcategoryMenuItem[] }> {
  const dbGender = mapGenderValue(gender);

  // Single query that fetches: main categories → subcategories → sub-subcategories
  const query = defineQuery(`*[_type == "category" && categoryType == "main"] | order(sortOrder asc, title asc) {
    _id,
    title,
    slug { current },
    "subcategories": *[_type == "category" && categoryType == "subcategory" && parentCategory._ref == ^._id] | order(title asc) {
      _id,
      title,
      slug { current },
      categoryType,
      "parentCategory": {
        "title": ^.title,
        "slug": ^.slug
      },
      "subSubcategories": *[_type == "category" && categoryType == "specific" && parentCategory._ref == ^._id] | order(sortOrder asc, title asc) {
        _id,
        title,
        slug { current },
        description,
        "productCount": count(*[_type == "product" && references(^._id) && (gender == $gender || gender == "unisex")]),
        sortOrder,
        "parentCategory": {
          "_id": ^._id,
          "title": ^.title,
          "slug": ^.slug
        }
      }
    }
  }`);

  try {
    const { data } = await sanityFetch({ query, params: { gender: dbGender } });
    const categories = data as Array<{
      _id: string;
      title: string;
      slug: { current: string };
      subcategories: SubcategoryMenuItem[];
    }>;

    // Transform to { [mainCategorySlug]: subcategories[] } format
    const result: { [mainCategorySlug: string]: SubcategoryMenuItem[] } = {};

    for (const category of categories || []) {
      if (category.slug?.current) {
        result[category.slug.current] = category.subcategories || [];
      }
    }

    return result;
  } catch (error) {
    console.error(`Error fetching category hierarchy for ${gender}:`, error);
    return {};
  }
}

/**
 * Fetches the full menu data for all genders in 2 queries (one per gender).
 * This replaces the 20+ sequential queries in HeaderServer.
 */
export async function getFullMenuData(): Promise<MenuData> {
  const [menData, womenData] = await Promise.all([
    getCategoryHierarchyForGender("men"),
    getCategoryHierarchyForGender("women"),
  ]);

  return {
    men: menData,
    women: womenData,
  };
}

