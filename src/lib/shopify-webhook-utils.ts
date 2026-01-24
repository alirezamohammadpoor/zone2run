import { createClient, type SanityClient } from "@sanity/client";
import { createHash } from "crypto";

// Shopify Webhook Types
interface ShopifyWebhookImage {
  id: number;
  src: string;
  altText?: string | null;
  width?: number;
  height?: number;
  position?: number;
}

interface ShopifyWebhookProduct {
  id: number;
  title: string;
  handle: string;
  vendor?: string | null;
  product_type?: string | null;
  body_html?: string | null;
  tags?: string | null;
  images?: ShopifyWebhookImage[];
}

// Sanity Image Types
interface SanityImageAsset {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
  alt: string;
}

interface ProcessedImages {
  mainImage: SanityImageAsset | null;
  gallery: SanityImageAsset[];
}

// Lazy-initialized Sanity client for webhook operations
// Uses a getter pattern to avoid build-time env var validation errors
let _webhookClient: SanityClient | null = null;
export function getWebhookSanityClient(): SanityClient {
  if (!_webhookClient) {
    const projectId = process.env.SANITY_PROJECT_ID;
    const token = process.env.SANITY_API_TOKEN;
    if (!projectId || !token) {
      throw new Error("Missing SANITY_PROJECT_ID or SANITY_API_TOKEN");
    }
    _webhookClient = createClient({
      projectId,
      dataset: process.env.SANITY_DATASET || "production",
      token,
      useCdn: false,
      apiVersion: "2023-05-03",
    });
  }
  return _webhookClient;
}

// Backwards compatibility - direct client access (lazy-initialized)
export const webhookSanityClient = new Proxy({} as SanityClient, {
  get(_, prop) {
    return getWebhookSanityClient()[prop as keyof SanityClient];
  },
});

// Helper function to generate unique filename
export function generateImageFilename(
  imageUrl: string,
  productId: string | number,
  index: number = 0
): string {
  const urlHash = createHash("md5")
    .update(imageUrl)
    .digest("hex")
    .substring(0, 8);
  const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
  return `product-${productId}-${index}-${urlHash}.${extension}`;
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
    return collections.map((collection: { _id: string }) => collection._id);
  } catch (error) {
    console.error("Error finding Sanity collections by Shopify IDs:", error);
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

      return products.map((product: { id: number; title: string; handle: string }) => ({
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
      const productIds = collects.map((collect: { product_id: number }) => collect.product_id);

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

    if (!shopDomain || !apiKey) {
      throw new Error("Missing Shopify credentials");
    }

    // First, get the product details to see if it has collection information
    const productUrl = `https://${shopDomain}/admin/api/unstable/products/${productId}.json`;

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

    // Check if product has collections data
    if (productData.product?.collections) {
      return productData.product.collections.map((collection: { id: number; title: string; handle: string }) => ({
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
      }));
    }

    // If no collections in product data, use collects API to get collection relationships
    const collectsUrl = `https://${shopDomain}/admin/api/unstable/collects.json?product_id=${productId}`;

    const response = await fetch(collectsUrl, {
      headers: {
        "X-Shopify-Access-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const collects = data.collects || [];

      if (collects.length > 0) {
        // Get collection details for each collect
        const collectionIds = collects.map(
          (collect: { collection_id: number }) => collect.collection_id
        );

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

        return collectionDetails.filter(Boolean) as Array<{
          id: number;
          title: string;
          handle: string;
        }>;
      } else {
        return [];
      }
    } else {
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
  client: SanityClient,
  images: ShopifyWebhookImage[],
  product: ShopifyWebhookProduct
): Promise<ProcessedImages> {
  if (!images || images.length === 0) {
    return { mainImage: null, gallery: [] };
  }

  console.log(
    `🖼️ Processing ${images.length} images for product: ${product.title}`
  );

  const gallery: SanityImageAsset[] = [];
  let mainImage: SanityImageAsset | null = null;

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

      const imageObj: SanityImageAsset = {
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
