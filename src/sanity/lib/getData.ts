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
    gender,
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
      },
      categoryType,
      parentCategory-> {
        _id,
        title,
        slug {
          current
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
    gender,
    subcategory-> {
      _id,
      title,
      slug {
        current
      }
    },
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

export async function getSubcategoriesByParent(parentSlug: string) {
  const query = `*[_type == "category" && categoryType == "sub" && parentCategory->slug.current == $parentSlug] {
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
  const query = `*[_type == "category" && categoryType == "sub" && parentCategory->slug.current in $parentSlugs] {
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
          // Only log warning in development
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "Could not find Shopify product for handle:",
              sanityProduct.shopifyHandle
            );
          }
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
        // Only log warning in development
        if (process.env.NODE_ENV === "development") {
          console.warn("Duplicate product handle found:", handle);
        }
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

export async function getProductsByBrand(brandSlug: string, limit?: number) {
  const query = `*[_type == "product" && brand->slug.current == $brandSlug] {
    _id,
    title,
    shopifyId,
    shopifyHandle,
    shortDescription,
    description,
    gender,
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
    category-> {
      _id,
      title,
      slug {
        current
      },
      categoryType,
      parentCategory-> {
        _id,
        title,
        slug {
          current
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
    featured,
    tags
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    const sanityProducts = await client.fetch(query, { brandSlug });

    // Fetch Shopify data for each product
    const combinedProducts = await Promise.all(
      sanityProducts.map(async (sanityProduct: any) => {
        if (!sanityProduct.shopifyHandle) {
          console.warn(`No Shopify handle for product: ${sanityProduct.title}`);
          return null;
        }

        try {
          const shopifyProduct = await getShopifyProductByHandle(
            sanityProduct.shopifyHandle
          );
          if (!shopifyProduct) {
            console.warn(
              `No Shopify product found for handle: ${sanityProduct.shopifyHandle}`
            );
            return null;
          }

          return createProduct(shopifyProduct, sanityProduct);
        } catch (error) {
          console.error(
            `Error fetching Shopify product for handle ${sanityProduct.shopifyHandle}:`,
            error
          );
          return null;
        }
      })
    );

    // Remove duplicates based on shopifyHandle
    const uniqueProducts = combinedProducts
      .filter(Boolean)
      .reduce((acc, product) => {
        if (
          product &&
          !acc.find((p: any) => p.shopify.handle === product.shopify.handle)
        ) {
          acc.push(product);
        }
        return acc;
      }, [] as any[]);

    return uniqueProducts;
  } catch (error) {
    console.error(`Error fetching products for brand ${brandSlug}:`, error);
    return [];
  }
}

export async function getProductsByGender(gender: string, limit?: number) {
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
    title,
    shopifyId,
    shopifyHandle,
    shortDescription,
    description,
    gender,
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
    category-> {
      _id,
      title,
      slug {
        current
      },
      categoryType,
      parentCategory-> {
        _id,
        title,
        slug {
          current
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
    featured,
    tags
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    const sanityProducts = await client.fetch(query, { gender: dbGender });

    // Fetch Shopify data for each product
    const combinedProducts = await Promise.all(
      sanityProducts.map(async (sanityProduct: any) => {
        if (!sanityProduct.shopifyHandle) {
          console.warn(`No Shopify handle for product: ${sanityProduct.title}`);
          return null;
        }

        try {
          const shopifyProduct = await getShopifyProductByHandle(
            sanityProduct.shopifyHandle
          );
          if (!shopifyProduct) {
            console.warn(
              `No Shopify product found for handle: ${sanityProduct.shopifyHandle}`
            );
            return null;
          }

          return createProduct(shopifyProduct, sanityProduct);
        } catch (error) {
          console.error(
            `Error fetching Shopify product for handle ${sanityProduct.shopifyHandle}:`,
            error
          );
          return null;
        }
      })
    );

    // Remove duplicates based on shopifyHandle
    const uniqueProducts = combinedProducts
      .filter(Boolean)
      .reduce((acc, product) => {
        if (
          product &&
          !acc.find((p: any) => p.shopify.handle === product.shopify.handle)
        ) {
          acc.push(product);
        }
        return acc;
      }, [] as any[]);

    return uniqueProducts;
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
    title,
    shopifyHandle,
    shortDescription,
    gender,
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
      },
      categoryType,
      parentCategory-> {
        _id,
        title,
        slug {
          current
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
    featured,
    tags
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`
      : `*[_type == "product" && 
        (gender == $gender || gender == "unisex") && 
        category->categoryType == $categoryType && 
        category->slug.current == $categorySlug
      ] {
    _id,
    title,
    shopifyHandle,
    shortDescription,
    gender,
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
      },
      categoryType,
      parentCategory-> {
        _id,
        title,
        slug {
          current
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
    featured,
    tags
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    const sanityProducts = await client.fetch(query, {
      gender: dbGender,
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
          // Only log warning in development
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "Could not find Shopify product for handle:",
              sanityProduct.shopifyHandle
            );
          }
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
        // Only log warning in development
        if (process.env.NODE_ENV === "development") {
          console.warn("Duplicate product handle found:", handle);
        }
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

export async function getProductsBySubcategoryIncludingSubSubcategories(
  gender: string,
  mainCategorySlug: string,
  subcategorySlug: string,
  limit?: number
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
    title,
    shopifyHandle,
    shortDescription,
    gender,
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
      },
      categoryType,
      parentCategory-> {
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
          },
          parentCategory-> {
            _id,
            title,
            slug {
              current
            }
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
    featured,
    tags
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    const sanityProducts = await client.fetch(query, {
      gender: dbGender,
      mainCategorySlug,
      subcategorySlug,
    });

    // Fetch Shopify data for each product (same logic as getProductsByPath)
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
          // Only log warning in development
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "Could not find Shopify product for handle:",
              sanityProduct.shopifyHandle
            );
          }
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
        // Only log warning in development
        if (process.env.NODE_ENV === "development") {
          console.warn("Duplicate product handle found:", handle);
        }
        return false;
      }
      seenHandles.add(handle);
      return true;
    });

    return uniqueProducts;
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

  // For 3-level categories, find products in the specific sub-subcategory
  const query = `*[_type == "product" && 
    (gender == $gender || gender == "unisex") && 
    category->categoryType == "sub" && 
    category->slug.current == $subsubcategorySlug &&
    category->parentCategory->slug.current == $subcategorySlug &&
    category->parentCategory->parentCategory->slug.current == $mainCategorySlug
  ] {
    _id,
    title,
    shopifyHandle,
    shortDescription,
    gender,
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
      },
      categoryType,
      parentCategory-> {
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
          },
          parentCategory-> {
            _id,
            title,
            slug {
              current
            }
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
    featured,
    tags
  } | order(title asc)${limit ? `[0...${limit}]` : ""}`;

  try {
    const sanityProducts = await client.fetch(query, {
      gender: dbGender,
      mainCategorySlug,
      subcategorySlug,
      subsubcategorySlug,
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
          // Only log warning in development
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "Could not find Shopify product for handle:",
              sanityProduct.shopifyHandle
            );
          }
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
        // Only log warning in development
        if (process.env.NODE_ENV === "development") {
          console.warn("Duplicate product handle found:", handle);
        }
        return false;
      }
      seenHandles.add(handle);
      return true;
    });

    return uniqueProducts;
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
