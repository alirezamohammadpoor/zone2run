// lib/sanity/getData.ts
import { client } from "@/sanity/lib/client";
import type { SanityProduct } from "@/types/sanity";
import { getShopifyProductByHandle } from "@/lib/shopify/products";
import { createProduct, type Product } from "@/types/product";

export async function getSanityProductByHandle(
  handle: string
): Promise<SanityProduct | null> {
  // First try with the original handle
  let query = `*[_type == "product" && shopifyHandle == $handle][0] {
    _id,
    title,
    shopifyId,
    shopifyHandle,
    shortDescription,
    description,
    
    mainImage {
      asset-> {
        url,
        metadata
      },
      alt
    },
    
    gallery[] {
      asset-> {
        url,
        metadata
      },
      alt
    },
    
    productDetails[] {
      title,
      value
    },
    
    careInstructions,
    
    category-> {
      _id,
      title,
      slug {
        current
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
    
    featured,
    tags
  }`;

  try {
    let sanityProduct = await client.fetch(query, { handle });

    // If not found and handle starts with "distance-lab-", try without the prefix
    if (!sanityProduct && handle.startsWith("distance-lab-")) {
      const handleWithoutPrefix = handle.replace("distance-lab-", "");
      sanityProduct = await client.fetch(query, {
        handle: handleWithoutPrefix,
      });
    }

    // If still not found and handle doesn't start with "distance-lab-", try with the prefix
    if (!sanityProduct && !handle.startsWith("distance-lab-")) {
      const handleWithPrefix = `distance-lab-${handle}`;
      sanityProduct = await client.fetch(query, { handle: handleWithPrefix });
    }

    return sanityProduct || null;
  } catch (error) {
    console.error("Error fetching Sanity product:", error);
    return null;
  }
}

// Additional helper functions you might need
export async function getSanityProductsByCategory(
  categorySlug: string
): Promise<SanityProduct[]> {
  const query = `*[_type == "product" && category->slug.current == $categorySlug] {
    _id,
    title,
    shopifyHandle,
    shortDescription,
    mainImage {
      asset-> {
        url,
        metadata
      },
      alt
    },
    category-> {
      _id,
      title,
      slug {
        current
      }
    },
    featured,
    tags
  }`;

  try {
    return await client.fetch(query, { categorySlug });
  } catch (error) {
    console.error("Error fetching Sanity products by category:", error);
    return [];
  }
}

export async function getFeaturedSanityProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product" && featured == true] | order(_createdAt desc) {
    _id,
    title,
    shopifyHandle,
    shortDescription,
    mainImage {
      asset-> {
        url,
        metadata
      },
      alt
    },
    category-> {
      _id,
      title,
      slug {
        current
      }
    },
    featured,
    tags
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching featured Sanity products:", error);
    return [];
  }
}

export async function getAllProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product"] {
    _id,
    title,
    shopifyHandle,
    shortDescription,
    mainImage {
      asset-> {
        url,
        metadata
      },
      alt
    },
    category-> {
      _id,
      title,
      slug {
        current
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
    featured,
    tags
  }`;

  try {
    const products = await client.fetch(query);

    return products;
  } catch (error) {
    console.error("Error fetching all Sanity products:", error);
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
    "productCount": count(*[_type == "product" && references(^._id)]),
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

export async function getSubcategoriesByParent(parentSlug: string) {
  const query = `*[_type == "category" && categoryType == "subcategory" && parentCategory->slug.current == $parentSlug] {
    _id,
    title,
    slug {
      current
    },
    description,
    "productCount": count(*[_type == "product" && references(^._id)]),
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
    return await client.fetch(query, { parentSlug });
  } catch (error) {
    console.error(`Error fetching subcategories for ${parentSlug}:`, error);
    return [];
  }
}

export async function getAllSubcategories(parentSlugs: string[]) {
  const query = `*[_type == "category" && categoryType == "subcategory" && parentCategory->slug.current in $parentSlugs] {
    _id,
    title,
    slug {
      current
    },
    description,
    "productCount": count(*[_type == "product" && references(^._id)]),
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
    return await client.fetch(query, { parentSlugs });
  } catch (error) {
    console.error(`Error fetching subcategories for ${parentSlugs}:`, error);
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
) {
  const query = `*[_type == "product" && (
    category->slug.current == $categorySlug || 
    category->parentCategory->slug.current == $categorySlug
  )] {
    _id,
    title,
    shopifyHandle,
    shortDescription,
    mainImage {
      asset-> {
        url,
        metadata
      },
      alt
    },
    category-> {
      _id,
      title,
      slug {
        current
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
    featured,
    tags
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    const sanityProducts = await client.fetch(query, { categorySlug });

    // Fetch Shopify data for each product
    const combinedProducts = await Promise.all(
      sanityProducts.map(async (sanityProduct: any) => {
        if (!sanityProduct.shopifyHandle) {
          return null;
        }

        // Try with distance-lab prefix if needed
        let shopifyProduct = await getShopifyProductByHandle(
          sanityProduct.shopifyHandle
        );

        if (
          !shopifyProduct &&
          !sanityProduct.shopifyHandle.startsWith("distance-lab-")
        ) {
          shopifyProduct = await getShopifyProductByHandle(
            `distance-lab-${sanityProduct.shopifyHandle}`
          );
        }

        if (!shopifyProduct) {
          console.warn(
            "Could not find Shopify product for handle:",
            sanityProduct.shopifyHandle
          );
          return null;
        }

        return createProduct(shopifyProduct, sanityProduct);
      })
    );

    // Filter out null results and deduplicate by Shopify handle
    const validProducts = combinedProducts.filter(
      (product): product is Product => product !== null
    );

    // Deduplicate by Shopify handle (keep the first occurrence)
    const seenHandles = new Set<string>();
    const uniqueProducts = validProducts.filter((product) => {
      const handle = product.shopify.handle;
      if (seenHandles.has(handle)) {
        console.warn("Duplicate product handle found:", handle);
        return false;
      }
      seenHandles.add(handle);
      return true;
    });

    return uniqueProducts;
  } catch (error) {
    console.error(
      `Error fetching products for category ${categorySlug}:`,
      error
    );
    return [];
  }
}

export async function getProductsByPath(
  gender: string,
  categoryType: string,
  categorySlug: string,
  limit?: number
) {
  const query = `*[_type == "product" && 
    gender == $gender && 
    category->categoryType == $categoryType && 
    category->slug.current == $categorySlug
  ] {
    _id,
    title,
    shopifyHandle,
    shortDescription,
    mainImage {
      asset-> {
        url,
        metadata
      },
      alt
    },
    category-> {
      _id,
      title,
      slug {
        current
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
    featured,
    tags
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    const sanityProducts = await client.fetch(query, {
      gender,
      categoryType,
      categorySlug,
    });

    // Fetch Shopify data for each product (same logic as getAllProducts)
    const combinedProducts = await Promise.all(
      sanityProducts.map(async (sanityProduct: any) => {
        if (!sanityProduct.shopifyHandle) {
          return null;
        }

        // Try with distance-lab prefix if needed
        let shopifyProduct = await getShopifyProductByHandle(
          sanityProduct.shopifyHandle
        );

        if (
          !shopifyProduct &&
          !sanityProduct.shopifyHandle.startsWith("distance-lab-")
        ) {
          shopifyProduct = await getShopifyProductByHandle(
            `distance-lab-${sanityProduct.shopifyHandle}`
          );
        }

        if (!shopifyProduct) {
          console.warn(
            "Could not find Shopify product for handle:",
            sanityProduct.shopifyHandle
          );
          return null;
        }

        return createProduct(shopifyProduct, sanityProduct);
      })
    );

    // Filter out null results and deduplicate by Shopify handle
    const validProducts = combinedProducts.filter(
      (product): product is Product => product !== null
    );

    // Deduplicate by Shopify handle (keep the first occurrence)
    const seenHandles = new Set<string>();
    const uniqueProducts = validProducts.filter((product) => {
      const handle = product.shopify.handle;
      if (seenHandles.has(handle)) {
        console.warn("Duplicate product handle found:", handle);
        return false;
      }
      seenHandles.add(handle);
      return true;
    });

    return uniqueProducts;
  } catch (error) {
    console.error(
      `Error fetching products for path ${gender}/${categoryType}/${categorySlug}:`,
      error
    );
    return [];
  }
}

export async function getSubcategoriesByParentAndGender(
  parentSlug: string,
  gender: string
) {
  const query = `*[_type == "category" && 
    categoryType == "subcategory" && 
    parentCategory->slug.current == $parentSlug &&
    _id in *[_type == "product" && gender in [$gender, "unisex"]].category._ref
  ] {
    _id,
    title,
    slug {
      current
    },
    parentCategory-> {
      title,
      slug {
        current
      }
    }
  }`;

  try {
    return await client.fetch(query, { parentSlug, gender });
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
