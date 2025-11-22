import { createClient } from "@sanity/client";
import { createHash } from "crypto";

// Sanity client for webhook operations
export const webhookSanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || "production",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
  apiVersion: "2023-05-03",
});

// Image optimization settings
export const IMAGE_OPTIMIZATION = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 85,
  format: "webp" as const,
};

// Helper function to create optimized image URL
export function createOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  const { width, height, quality, format } = {
    ...IMAGE_OPTIMIZATION,
    ...options,
  };

  // For Shopify images, we can use their image transformation API
  if (originalUrl.includes("cdn.shopify.com")) {
    const url = new URL(originalUrl);
    const pathParts = url.pathname.split("/");
    const filename = pathParts[pathParts.length - 1];
    const baseUrl = url.origin + pathParts.slice(0, -1).join("/");

    return `${baseUrl}/${width}x${height}/crop=center,quality=${quality},format=${format}/${filename}`;
  }

  return originalUrl;
}

// Helper function to generate unique filename
export function generateImageFilename(
  imageUrl: string,
  productId: string,
  index: number = 0
): string {
  const urlHash = createHash("md5")
    .update(imageUrl)
    .digest("hex")
    .substring(0, 8);
  const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
  return `product-${productId}-${index}-${urlHash}.${extension}`;
}

// Helper function to validate image URL
export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === "https:" &&
      (parsedUrl.hostname.includes("cdn.shopify.com") ||
        parsedUrl.hostname.includes("shopify.com"))
    );
  } catch {
    return false;
  }
}

// Helper function to get image dimensions from URL
export async function getImageDimensions(
  imageUrl: string
): Promise<{ width: number; height: number } | null> {
  try {
    const response = await fetch(imageUrl, { method: "HEAD" });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) return null;

    // For Shopify images, we can extract dimensions from the URL
    if (imageUrl.includes("cdn.shopify.com")) {
      const match = imageUrl.match(/(\d+)x(\d+)/);
      if (match) {
        return {
          width: parseInt(match[1]),
          height: parseInt(match[2]),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function getSanityCollectionByShopifyId(
  shopifyCollectionId: string
): Promise<string | null> {
  try {
    const collection = await webhookSanityClient.fetch(
      `*[_type == "collection" && store.id == $shopifyId][0]`,
      { shopifyId: parseInt(shopifyCollectionId) }
    );

    return collection?._id || null;
  } catch (error) {
    console.error("Error finding Sanity collection by Shopify ID:", error);
    return null;
  }
}

export async function getSanityCollectionsByShopifyIds(
  shopifyCollectionIds: string[]
): Promise<string[]> {
  try {
    const collections = await webhookSanityClient.fetch(
      `*[_type == "collection" && store.id in $shopifyIds] {
      _id,
      "shopifyId": store.id}
      `,
      { shopifyIds: shopifyCollectionIds.map(Number) }
    );
    return collections.map((collection: any) => collection._id);
  } catch (error) {
    console.error("Error finding Sanity collections by Shopify IDs:", error);
    return [];
  }
}

export async function getSanityCollectionsByShopifyHandles(
  shopifyCollectionIds: string[]
): Promise<string[]> {
  try {
    const collections = await webhookSanityClient.fetch(
      `*[_type == "collection" && store.id in $shopifyIds] {
        _id,
        "shopifyId": store.id}
      `,
      { shopifyHandles: shopifyCollectionIds }
    );
    return collections.map((collection: any) => collection._id);
  } catch (error) {
    console.error(
      "Error finding Sanity collections by Shopify handles:",
      error
    );
    return [];
  }
}

// Get products in a collection from Shopify
export async function getCollectionProducts(
  collectionId: string
): Promise<Array<{ id: number; title: string; handle: string }>> {
  try {
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const apiKey = process.env.SHOPIFY_ADMIN_API_TOKEN;

    if (!shopDomain || !apiKey) {
      throw new Error("Missing Shopify credentials");
    }

    // Try collection products endpoint first (works for both manual and smart collections)
    const productsUrl = `https://${shopDomain}/admin/api/unstable/collections/${collectionId}/products.json?limit=250`;
    console.log("🔗 Collection Products API URL:", productsUrl);

    const response = await fetch(productsUrl, {
      headers: {
        "X-Shopify-Access-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const products = data.products || [];
      console.log(
        `📦 Found ${products.length} products in collection ${collectionId}`
      );

      return products.map((product: any) => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
      }));
    }

    // Fallback: Try collects API for manual collections
    console.log(
      "⚠️ Collection products endpoint failed, trying collects API..."
    );
    const collectsUrl = `https://${shopDomain}/admin/api/unstable/collects.json?collection_id=${collectionId}&limit=250`;
    const collectsResponse = await fetch(collectsUrl, {
      headers: {
        "X-Shopify-Access-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (collectsResponse.ok) {
      const collectsData = await collectsResponse.json();
      const collects = collectsData.collects || [];
      console.log(
        `📦 Found ${collects.length} collects in collection ${collectionId}`
      );

      if (collects.length === 0) {
        return [];
      }

      // Get product IDs from collects
      const productIds = collects.map((collect: any) => collect.product_id);

      // Fetch product details in batches
      const products: Array<{ id: number; title: string; handle: string }> = [];
      const batchSize = 50;

      for (let i = 0; i < productIds.length; i += batchSize) {
        const batch = productIds.slice(i, i + batchSize);
        const productDetails = await Promise.all(
          batch.map(async (productId: number) => {
            try {
              const productUrl = `https://${shopDomain}/admin/api/unstable/products/${productId}.json`;
              const productResponse = await fetch(productUrl, {
                headers: {
                  "X-Shopify-Access-Token": apiKey,
                  "Content-Type": "application/json",
                },
              });

              if (productResponse.ok) {
                const productData = await productResponse.json();
                return {
                  id: productData.product.id,
                  title: productData.product.title,
                  handle: productData.product.handle,
                };
              }
            } catch (error) {
              console.error(`Error fetching product ${productId}:`, error);
            }
            return null;
          })
        );

        products.push(
          ...(productDetails.filter(Boolean) as Array<{
            id: number;
            title: string;
            handle: string;
          }>)
        );
      }

      console.log(`✅ Retrieved ${products.length} products from collection`);
      return products;
    }

    console.log(
      `❌ Both endpoints failed: ${response.status} and ${collectsResponse.status}`
    );
    return [];
  } catch (error) {
    console.error("Error fetching collection products from Shopify:", error);
    return [];
  }
}

// Shopify API helper functions
export async function getProductCollections(
  productId: string
): Promise<Array<{ id: number; title: string; handle: string }>> {
  try {
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const apiKey = process.env.SHOPIFY_ADMIN_API_TOKEN;

    console.log("🔑 Environment check:", {
      shopDomain: shopDomain ? "✅ Set" : "❌ Missing",
      apiKey: apiKey ? "✅ Set" : "❌ Missing",
    });

    if (!shopDomain || !apiKey) {
      throw new Error("Missing Shopify credentials");
    }

    // First, get the product details to see if it has collection information
    const productUrl = `https://${shopDomain}/admin/api/unstable/products/${productId}.json`;
    console.log("🔗 Product API URL:", productUrl);

    const productResponse = await fetch(productUrl, {
      headers: {
        "X-Shopify-Access-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!productResponse.ok) {
      if (productResponse.status === 404) {
        console.log("⚠️ Product not found in Shopify (404)");
        return [];
      }
      throw new Error(
        `Shopify Product API error: ${productResponse.status} ${productResponse.statusText}`
      );
    }

    const productData = await productResponse.json();
    console.log("📦 Product data from API:", {
      id: productData.product?.id,
      title: productData.product?.title,
      collections: productData.product?.collections?.length || 0,
    });

    // Check if product has collections data
    if (productData.product?.collections) {
      return productData.product.collections.map((collection: any) => ({
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
      }));
    }

    // If no collections in product data, use collects API to get collection relationships
    const collectsUrl = `https://${shopDomain}/admin/api/unstable/collects.json?product_id=${productId}`;
    console.log("🔗 Collects API URL:", collectsUrl);

    // Also try smart_collections endpoint
    const smartCollectionsUrl = `https://${shopDomain}/admin/api/unstable/smart_collections.json`;
    console.log("🔗 Smart Collections API URL:", smartCollectionsUrl);

    const response = await fetch(collectsUrl, {
      headers: {
        "X-Shopify-Access-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    // Try smart collections first
    const smartResponse = await fetch(smartCollectionsUrl, {
      headers: {
        "X-Shopify-Access-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    // Don't return all smart collections - only return collections that the product actually belongs to
    // The smart collections endpoint returns ALL collections, not product-specific ones

    if (response.ok) {
      const data = await response.json();
      const collects = data.collects || [];
      console.log("🔗 Collects found:", collects.length);

      if (collects.length > 0) {
        // Get collection details for each collect
        const collectionIds = collects.map(
          (collect: any) => collect.collection_id
        );
        console.log("📚 Collection IDs from collects:", collectionIds);

        // Fetch collection details
        const collectionDetails = await Promise.all(
          collectionIds.map(async (collectionId: number) => {
            try {
              const collectionUrl = `https://${shopDomain}/admin/api/unstable/collections/${collectionId}.json`;
              const collectionResponse = await fetch(collectionUrl, {
                headers: {
                  "X-Shopify-Access-Token": apiKey,
                  "Content-Type": "application/json",
                },
              });

              if (collectionResponse.ok) {
                const collectionData = await collectionResponse.json();
                return {
                  id: collectionData.collection.id,
                  title: collectionData.collection.title,
                  handle: collectionData.collection.handle,
                };
              }
            } catch (error) {
              console.error(
                `Error fetching collection ${collectionId}:`,
                error
              );
            }
            return null;
          })
        );

        const validCollections = collectionDetails.filter(Boolean);
        console.log("📚 Valid collections:", validCollections.length);
        return validCollections;
      } else {
        console.log("ℹ️ No collections found for this product");
        return [];
      }
    } else {
      console.log(
        `❌ Collects API failed: ${response.status} ${response.statusText}`
      );
      return [];
    }
  } catch (error) {
    console.error("Error fetching product collections from Shopify:", error);
    return [];
  }
}

// Helper function to extract gender from product data
export function extractGenderFromProduct(
  title: string,
  tags: string
): string | null {
  const searchText = `${title} ${tags || ""}`.toLowerCase();

  // Look for gender indicators in title first (more reliable)
  if (searchText.includes("women's") || searchText.includes("womens"))
    return "womens";
  if (searchText.includes("men's") || searchText.includes("mens"))
    return "mens";
  if (searchText.includes("unisex")) return "unisex";
  if (searchText.includes("kids") || searchText.includes("children"))
    return "kids";

  // If no gender found in title, check tags as fallback
  if (tags) {
    const tagList = tags
      .toLowerCase()
      .split(",")
      .map((tag) => tag.trim());

    if (tagList.includes("mens") || tagList.includes("men")) return "mens";
    if (tagList.includes("womens") || tagList.includes("women"))
      return "womens";
    if (tagList.includes("unisex")) return "unisex";
    if (tagList.includes("kids")) return "kids";
  }

  return null;
}

// Helper function to extract category from product data
// UPDATED: Now uses Shopify product_type directly as category slug
export function extractCategoryFromProduct(
  title: string,
  productType: string,
  tags: string
): string | null {
  if (!productType) return null;

  // Convert Shopify product_type directly to slug
  // Example: "Running Shoes" → "running-shoes", "Backpacks" → "backpacks"
  return productType
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper function to find existing category in Sanity (NO AUTO-CREATE)
export async function getOrCreateCategory(
  categorySlug: string,
  categoryTitle: string
): Promise<string | null> {
  try {
    // Only find existing category by slug
    const category = await webhookSanityClient.fetch(
      `*[_type == "category" && slug.current == $slug][0]`,
      { slug: categorySlug }
    );

    if (category) {
      console.log("📂 Found existing category:", category._id);
      return category._id;
    }

    // Do NOT create - just log and return null
    console.log(`⚠️ Category not found: ${categorySlug} (${categoryTitle})`);
    return null;
  } catch (error) {
    console.error("❌ Error finding category:", error);
    return null;
  }
}

// ============================================
// IMAGE PROCESSING FUNCTIONS
// ============================================

// Helper function to download image from URL
export async function downloadImage(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

// Helper function to process product images and upload to Sanity
export async function processProductImages(
  client: any,
  images: any[],
  product: any
): Promise<{
  mainImage: any;
  gallery: any[];
}> {
  if (!images || images.length === 0) {
    return { mainImage: null, gallery: [] };
  }

  console.log(
    `🖼️ Processing ${images.length} images for product: ${product.title}`
  );

  const gallery: any[] = [];
  let mainImage: any = null;

  for (const [index, image] of images.entries()) {
    try {
      // Download image
      const imageBuffer = await downloadImage(image.src);
      const filename = generateImageFilename(image.src, product.id, index);

      // Upload to Sanity
      const imageAsset = await client.assets.upload("image", imageBuffer, {
        filename,
        title: `${product.title} - Image ${index + 1}`,
      });

      const imageObj = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: imageAsset._id,
        },
        alt: image.altText || `${product.title} - Image ${index + 1}`,
      };

      // First image is main image, rest go to gallery
      if (index === 0) {
        mainImage = imageObj;
      } else {
        gallery.push(imageObj);
      }
    } catch (error) {
      console.error(`❌ Error processing image ${index + 1}:`, error);
    }
  }

  console.log(
    `✅ Processed ${gallery.length + (mainImage ? 1 : 0)} images successfully`
  );
  return { mainImage, gallery };
}
