// lib/sanity/getData.ts
import { client } from "@/sanity/lib/client";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import type { SanityProduct } from "@/types/sanityProduct";

// Create a non-CDN client for fetching latest data without cache
const liveClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disable CDN to get latest published data immediately
});

export async function getSanityProductByHandle(
  handle: string
): Promise<SanityProduct | null> {
  const query = `*[_type == "product" && (shopifyHandle == $handle || store.slug.current == $handle)][0] {
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
      "url": coalesce(mainImage.asset->url, store.previewImageUrl),
      "alt": coalesce(mainImage.alt, store.title)
    },
    "gallery": gallery[] {
      "url": asset->url,
      alt
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
        "slug": slug.current,
        categoryType,
        parentCategory-> {
          _id,
          title,
          "slug": slug.current
        }
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
    return await client.fetch(query, { handle });
  } catch (error) {
    console.error("Error fetching Sanity product by handle:", error);
    return null;
  }
}

export async function getAllProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product"] {
    _id,
    "title": store.title,
    "handle": store.slug.current,
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
        "slug": slug.current,
        categoryType,
        parentCategory-> {
          _id,
          title,
          "slug": slug.current
        }
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
    featured
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}

export async function getAllCategories() {
  const query = `*[_type == "category"] {
    _id,
    title,
    slug {
      current
    },
    description,
    "productCount": count(*[_type == "product" && references(^._id)]),
    featured,
    sortOrder
  } | order(sortOrder asc, title asc)`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
}

export async function getAllBrands() {
  const query = `*[_type == "brand"] {
    _id,
    name,
    slug {
      current
    },
    logo {
      asset-> {
        url
      }
    },
    "productCount": count(*[_type == "product" && references(^._id)]),
    featured
  } | order(name asc)`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching all brands:", error);
    return [];
  }
}

export async function getBrandBySlug(slug: string) {
  const query = `*[_type == "brand" && slug.current == $slug][0] {
    _id,
    name,
    description,
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
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error(`Error fetching brand ${slug}:`, error);
    return null;
  }
}

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

export async function getCategoryBySlug(slug: string) {
  const query = `*[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug { current },
    description,
    categoryType,
    parentCategory->{
      _id,
      title,
      slug { current }
    },
    "productCount": count(*[_type == "product" && references(^._id)]),
    featured,
    sortOrder,
    visibility
  }`;

  try {
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return null;
  }
}

export async function getProductsByCategory(
  categorySlug: string,
  limit?: number
): Promise<SanityProduct[]> {
  const query = `*[_type == "product" && (
    category->slug.current == $categorySlug || 
    category->parentCategory->slug.current == $categorySlug
  )] {
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
      "url": coalesce(mainImage.asset->url, store.previewImageUrl),
      "alt": coalesce(mainImage.alt, store.title)
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
        "slug": slug.current,
        categoryType,
        parentCategory-> {
          _id,
          title,
          "slug": slug.current
        }
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
    featured
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    return await client.fetch(query, { categorySlug });
  } catch (error) {
    console.error(
      `Error fetching products for category ${categorySlug}:`,
      error
    );
    return [];
  }
}

export async function getProductsByBrand(
  brandSlug: string,
  limit?: number,
  gender?: string
): Promise<SanityProduct[]> {
  // Map frontend gender values to database values
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };

  const dbGender = gender ? genderMap[gender] || gender : null;

  // Build gender filter - if gender provided, filter by gender OR unisex
  const genderFilter = dbGender
    ? `&& (gender == $dbGender || gender == "unisex")`
    : "";

  // Try exact match first, then case-insensitive match as fallback
  const query = `*[_type == "product" && (brand->slug.current == $brandSlug || lower(brand->slug.current) == lower($brandSlug))${genderFilter}] {
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
      "url": coalesce(mainImage.asset->url, store.previewImageUrl),
      "alt": coalesce(mainImage.alt, store.title)
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
        "slug": slug.current,
        categoryType,
        parentCategory-> {
          _id,
          title,
          "slug": slug.current
        }
      }
    },
    brand-> {
      _id,
      name,
      description,
      slug {
        current
      },
    },
    gender,
    featured
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    const params = dbGender ? { brandSlug, dbGender } : { brandSlug };
    return await client.fetch(query, params);
  } catch (error) {
    console.error(`Error fetching products for brand ${brandSlug}:`, error);
    return [];
  }
}

export async function getProductsByGender(
  gender: string,
  limit?: number
): Promise<SanityProduct[]> {
  // Map frontend gender values to database values
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };

  const dbGender = genderMap[gender] || gender;

  const query = `*[_type == "product" && (gender == $gender || gender == "unisex")] {
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
      "url": coalesce(mainImage.asset->url, store.previewImageUrl),
      "alt": coalesce(mainImage.alt, store.title)
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
        "slug": slug.current,
        categoryType,
        parentCategory-> {
          _id,
          title,
          "slug": slug.current
        }
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
    featured
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    return await client.fetch(query, { gender: dbGender });
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
  // Map frontend gender values to database values
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };

  const dbGender = genderMap[gender] || gender;

  // For main categories, we need to find products in subcategories under that main category
  const query =
    categoryType === "main"
      ? `*[_type == "product" && 
        (gender == $gender || gender == "unisex") && 
        (
          // Products directly in the main category
          (category->categoryType == "main" && 
           category->slug.current == $categorySlug)
          ||
          // Products directly in subcategories under this main category
          (category->categoryType == "subcategory" && 
           category->parentCategory->slug.current == $categorySlug)
          ||
          // Products in sub-subcategories under subcategories of this main category
          (category->categoryType == "specific" && 
           category->parentCategory->parentCategory->slug.current == $categorySlug)
        )
      ] {
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
      "url": coalesce(mainImage.asset->url, store.previewImageUrl),
      "alt": coalesce(mainImage.alt, store.title)
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
        "slug": slug.current,
        categoryType,
        parentCategory-> {
          _id,
          title,
          "slug": slug.current
        }
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
    featured
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`
      : `*[_type == "product" && 
        (gender == $gender || gender == "unisex") && 
        category->categoryType == $categoryType && 
        category->slug.current == $categorySlug
      ] {
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
      "url": coalesce(mainImage.asset->url, store.previewImageUrl),
      "alt": coalesce(mainImage.alt, store.title)
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
        "slug": slug.current,
        categoryType,
        parentCategory-> {
          _id,
          title,
          "slug": slug.current
        }
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
    featured
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    return await client.fetch(query, {
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
  // Map frontend gender values to database values
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };

  const dbGender = genderMap[gender] || gender;

  // Query to get products from the subcategory AND all its sub-subcategories
  const query = `*[_type == "product" && 
    (gender == $gender || gender == "unisex") && 
    (
      // Products directly in the subcategory
      (category->categoryType == "subcategory" && 
       category->slug.current == $subcategorySlug &&
       category->parentCategory->slug.current == $mainCategorySlug)
      ||
      // Products in sub-subcategories under this subcategory
      (category->categoryType == "specific" && 
       category->parentCategory->slug.current == $subcategorySlug &&
       category->parentCategory->parentCategory->slug.current == $mainCategorySlug)
    )
  ] {
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
      "url": coalesce(mainImage.asset->url, store.previewImageUrl),
      "alt": coalesce(mainImage.alt, store.title)
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
    featured
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    return await client.fetch(query, {
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
  // Map frontend gender values to database values
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };

  const dbGender = genderMap[gender] || gender;

  // For 3-level categories, find products in the specific sub-subcategory
  const query = `*[_type == "product" && 
    (gender == $gender || gender == "unisex") && 
    category->categoryType == "specific" && 
    category->slug.current == $subsubcategorySlug &&
    category->parentCategory->slug.current == $subcategorySlug &&
    category->parentCategory->parentCategory->slug.current == $mainCategorySlug
  ] {
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
      "url": coalesce(mainImage.asset->url, store.previewImageUrl),
      "alt": coalesce(mainImage.alt, store.title)
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
    featured
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    return await client.fetch(query, {
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

export async function getSubSubcategoriesByParentAndGender(
  parentSlug: string,
  gender: string
) {
  // Map frontend gender values to database values
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };

  const dbGender = genderMap[gender] || gender;

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
  // Map frontend gender values to database values
  const genderMap: { [key: string]: string } = {
    men: "mens",
    women: "womens",
    mens: "mens",
    womens: "womens",
    unisex: "unisex",
  };

  const dbGender = genderMap[gender] || gender;

  // Use the correct category type for subcategories
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

export async function getMainCategoryBySub(subcategorySlug: string) {
  const query = `*[_type == "category" && 
    categoryType == "subcategory" && 
    slug.current == $subcategorySlug
  ][0] {
    _id,
    title,
    slug {
      current
    },
    parentCategory-> {
      _id,
      title,
      slug {
        current
      }
    }
  }`;

  try {
    return await client.fetch(query, { subcategorySlug });
  } catch (error) {
    console.error(
      `Error fetching main category for subcategory ${subcategorySlug}:`,
      error
    );
    return null;
  }
}
export async function getProductDescription(productId: string) {
  const query = `*[_type == "product" && _id == $productId] {
 "htmlDescription": store.htmlDescription
  }[0]`;

  try {
    const result = await client.fetch(query, { productId });
    return result?.htmlDescription || null;
  } catch (error) {
    console.error(
      `Error fetching product description for ${productId}:`,
      error
    );
    return null;
  }
}

export async function getBlogPosts(limit?: number) {
  const query = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug {
      current
    },
    productsModule {
      ...,
      featuredProducts[] {
        ...,
        product-> {
          _id,
          "title": coalesce(title, store.title),
          "handle": coalesce(shopifyHandle, store.slug.current),
          brand-> { _id, name },
          "mainImage": {
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title)
          },
          "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
        }
      }
    },
    featuredProductsModule {
      ...,
      featuredProducts[] {
        ...,
        product-> {
          _id,
          "title": coalesce(title, store.title),
          "handle": coalesce(shopifyHandle, store.slug.current),
          brand-> { _id, name },
          "mainImage": {
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title)
          },
          "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
        }
      }
    },
    productShowcaseModule {
      ...,
      featuredProducts[] {
        ...,
        product-> {
          _id,
          "title": coalesce(title, store.title),
          "handle": coalesce(shopifyHandle, store.slug.current),
          brand-> { _id, name },
          "mainImage": {
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title)
          },
          "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
        }
      }
    },
    excerpt,
    publishedAt,
    author,
    category-> {
      title,
      slug {
        current
      }
    },
    featuredImage {
      asset-> {
        url,
        metadata
      },
      alt
    },
    editorialImage {
      asset-> {
        url,
        metadata
      },
      alt
    },
    readingTime
  }${limit ? `[0...${limit}]` : ""}`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPost(slug: string) {
  const query = `*[_type == "blogPost" && slug.current == $slug][0] {
    ...,
    _id,
    title,
    slug { current },
    content[] {
      ...,
      _type == "image" => {
        ...,
        asset-> { url, metadata }
      },
      _type == "blogProductsModule" => {
        ...,
        featuredProducts[] {
          ...,
          product-> {
            _id,
            "title": coalesce(title, store.title),
            "handle": coalesce(shopifyHandle, store.slug.current),
            brand-> { _id, name, "slug": slug.current },
            "priceRange": {
              "minVariantPrice": store.priceRange.minVariantPrice,
              "maxVariantPrice": store.priceRange.maxVariantPrice
            },
            "mainImage": {
              "url": coalesce(mainImage.asset->url, store.previewImageUrl),
              "alt": coalesce(mainImage.alt, store.title)
            },
            "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
          }
        }
      }
    },
    excerpt,
    publishedAt,
    author,
    readingTime,
    mediaType,
    category-> { title, slug { current } },
    featuredImage { asset-> { url, metadata }, alt },
    featuredVideo { asset-> { url, metadata } },
    heroHeight,
    productsModule {
      ...,
      featuredProducts[] {
        ...,
        product-> {
          _id,
          "title": coalesce(title, store.title),
          "handle": coalesce(shopifyHandle, store.slug.current),
          brand-> { _id, name, "slug": slug.current },
          "priceRange": {
            "minVariantPrice": store.priceRange.minVariantPrice,
            "maxVariantPrice": store.priceRange.maxVariantPrice
          },
          "mainImage": {
            "url": coalesce(mainImage.asset->url, store.previewImageUrl),
            "alt": coalesce(mainImage.alt, store.title)
          },
          "gallery": gallery[] { "url": asset->url, alt } | order(_key asc)
        }
      }
    }
  }`;

  try {
    const post = await client.fetch(query, { slug });
    return post;
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}

export async function getProductsByIds(
  productIds: string[]
): Promise<SanityProduct[]> {
  if (productIds.length === 0) return [];

  const query = `*[_id in $productIds] {
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
      "alt": store.title
    },
    "gallery": gallery[] {
      "url": asset->url,
      alt
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
        "slug": slug.current,
        categoryType,
        parentCategory-> {
          _id,
          title,
          "slug": slug.current
        }
      }
    },
    "brandRef": brand._ref,
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
    featured
  }`;

  try {
    const products = await client.fetch(query, { productIds });

    return products;
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    return [];
  }
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
        url
      },
      alt
    },
    sortOrder
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export async function getMenu() {
  const query = `*[_type == "navigationMenu"][0] {
    men {
      featuredCollections[]-> {
        _id,
        "title": store.title,
        "slug": store.slug {
          current
        },
        menuImage {
          asset-> {
            _id,
            url
          },
          alt
        }
      }
    },
    women {
      featuredCollections[]-> {
        _id,
        "title": store.title,
        "slug": store.slug {
          current
        },
        menuImage {
          asset-> {
            _id,
            url
          },
          alt
        }
      }
    },
    help {
      links[] {
        label,
        url,
        _key
      }
    },
    "ourSpace": ourSpace {
      links[] {
        label,
        url,
        _key
      }
    }
  }`;

  try {
    const menu = await client.fetch(query);
    // Return null if document doesn't exist (empty result)
    return menu || null;
  } catch (error) {
    console.error("Error fetching menu:", error);
    return null;
  }
}

export async function getCollectionBySlug(slug: string) {
  // Try exact match first, then case-insensitive match as fallback
  const collectionQuery = `*[_type == "collection" && (store.slug.current == $slug || lower(store.slug.current) == lower($slug))][0]{
    _id,
    "title": store.title,
    "shopifyId": store.id,
    description,
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
      "alt": store.title
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
    const collection = await client.fetch(collectionQuery, { slug });
    if (!collection) return null;

    // Fetch products using both collection reference and Shopify ID
    // Convert shopifyId to string for array matching
    const shopifyIdStr = collection.shopifyId
      ? collection.shopifyId.toString()
      : "";

    let products = await client.fetch(productsQuery, {
      collectionId: collection._id,
      shopifyIdStr: shopifyIdStr,
    });

    // Log for debugging if no products found
    if ((!products || products.length === 0) && collection.shopifyId) {
      console.log(
        `⚠️ No products found for collection "${collection.title}" (Shopify ID: ${collection.shopifyId})`
      );
    }

    // Apply sorting logic based on curatedProducts
    if (collection.curatedProducts && collection.curatedProducts.length > 0) {
      // Create a Map of curated product IDs to their index (for ordering)
      const curatedIds = new Map(
        collection.curatedProducts.map((p: any, idx: number) => [p._id, idx])
      );

      // Sort products: curated ones first (by array index), then others (by creation date)
      products.sort((a: any, b: any) => {
        const aInCurated = curatedIds.has(a._id);
        const bInCurated = curatedIds.has(b._id);

        if (aInCurated && bInCurated) {
          const aIdx = curatedIds.get(a._id) ?? 0;
          const bIdx = curatedIds.get(b._id) ?? 0;
          // Sort by ascending index so first item in array shows first
          return Number(aIdx) - Number(bIdx);
        }
        if (aInCurated) return -1;
        if (bInCurated) return 1;

        // Both not in curated - sort by creation date (newest first)
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return Number(bDate) - Number(aDate);
      });
    } else {
      // Default: newest first (by creation date)
      products.sort((a: any, b: any) => {
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

export async function getCmsPage(slug: string[]) {
  const fullSlug = slug.join("/");
  const query = `*[_type == "cmsPage" && slug.current == $fullSlug][0]{
    _id,
    title,
    slug,
    content
  }`;

  try {
    return await client.fetch(query, { fullSlug });
  } catch (error) {
    console.error(`Error fetching CMS page ${fullSlug}:`, error);
    return null;
  }
}

export async function getHomepage() {
  const query = `*[_type == "home"][0] {
    _id,
    title,
    modules[] {
      _key,
      _type,
      ...,
      ...select(_type == "featuredProductsModule" => {
        featuredProducts[] {
          ...,
          imageSelection,
          product {
            _ref,
            _type
          }
        }
      }),
      ...select(_type == "editorialModule" => {
        featuredPosts[] {
          ...,
          post-> {
            _id,
            title,
            slug {
              current
            },
            excerpt,
            publishedAt,
            author,
            readingTime,
            category-> {
              title,
              slug {
                current
              }
            },
            featuredImage {
              asset-> {
                url,
                metadata
              },
              alt
            },
            editorialImage {
              asset-> {
                url,
                metadata
              },
              alt
            }
          }
        }
      }),
      ...select(_type == "heroModule" => {
        heroImage {
          asset-> {
            url,
            metadata
          },
          alt
        },
        heroVideo {
          asset-> {
            _ref,
            url
          }
        }
      }),
      ...select(_type == "imageModule" => {
        image {
          asset-> {
            url,
            metadata
          },
          alt
        },
        video {
          asset-> {
            url
          }
        },
        content
      })
    },
    seo {
      ...
    }
  }`;

  try {
    // Use liveClient (no CDN) to get latest published data immediately
    return await liveClient.fetch(query);
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}
