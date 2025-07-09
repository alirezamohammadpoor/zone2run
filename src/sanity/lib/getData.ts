// lib/sanity/getData.ts
import { client } from "@/sanity/lib/client";
import type { SanityProduct } from "@/types/sanity";

export async function getSanityProductByHandle(
  handle: string
): Promise<SanityProduct | null> {
  const query = `*[_type == "product" && shopifyHandle == $handle][0] {
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
    const sanityProduct = await client.fetch(query, { handle });
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
