import { client } from "@/sanity/lib/client";
import { mapGenderValue } from "./groqUtils";

export async function getAllMainCategories() {
  const query = `*[_type == "category" && categoryType == "main"] {
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
  } | order(sortOrder asc, title asc)`;

  try {
    return await client.fetch(query);
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

  const query = `*[_type == "category" && 
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
  } | order(sortOrder asc, title asc)`;

  try {
    return await client.fetch(query, { parentSlug, gender: dbGender });
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

  const query = `*[_type == "category" && 
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
  } | order(title asc)`;

  try {
    const result = await client.fetch(query, { parentSlug, gender: dbGender });
    return result;
  } catch (error) {
    console.error(
      `Error fetching subcategories for ${parentSlug} and ${gender}:`,
      error
    );
    return [];
  }
}

