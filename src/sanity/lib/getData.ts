// lib/sanity/getData.ts
import { client } from "@/sanity/lib/client";
import type { SanityProduct } from "@/types/sanityProduct";

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
    featured
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
  limit?: number
): Promise<SanityProduct[]> {
  const query = `*[_type == "product" && brand->slug.current == $brandSlug] {
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
    featured
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    return await client.fetch(query, { brandSlug });
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
          // Products directly in subcategories under this main category
          (category->categoryType == "sub" && 
           category->parentCategory->slug.current == $categorySlug)
          ||
          // Products in sub-subcategories under subcategories of this main category
          (category->categoryType == "sub" && 
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
      (category->categoryType == "sub" && 
       category->slug.current == $subcategorySlug &&
       category->parentCategory->slug.current == $mainCategorySlug)
      ||
      // Products in sub-subcategories under this subcategory
      (category->categoryType == "sub" && 
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
    category->categoryType == "sub" && 
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
    categoryType == "sub" && 
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

  // Use the same category type as breadcrumbs: "sub"
  const query = `*[_type == "category" && 
    categoryType == "sub" && 
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
    categoryType == "sub" && 
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
    description,
    "descriptionRaw": description[].children[].text
  }[0]`;

  try {
    const result = await client.fetch(query, { productId });
    return result?.descriptionRaw?.join(" ") || null;
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
    _id,
    title,
    slug {
      current
    },
    content[] {
      ...,
      _type == "image" => {
        ...,
        asset-> {
          url,
          metadata
        }
      }
    },
    excerpt,
    publishedAt,
    author,
    readingTime,
    mediaType,
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
    featuredVideo {
      asset-> {
        url,
        metadata
      }
    },
    heroHeight
  }`;

  try {
    return await client.fetch(query, { slug });
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
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}
