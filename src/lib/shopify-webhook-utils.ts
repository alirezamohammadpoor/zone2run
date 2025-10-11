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
export function extractCategoryFromProduct(
  title: string,
  productType: string,
  tags: string
): string | null {
  // Primary: Use product_type as the main category source
  if (productType) {
    const type = productType.toLowerCase().trim();

    // Direct mapping from product_type to category
    switch (type) {
      case "shoes":
      case "footwear":
      case "sneakers":
        // For shoes, check title for more specific category
        const titleLower = title.toLowerCase();
        if (titleLower.includes("trail")) return "trail-running";
        if (titleLower.includes("running")) return "road-running";
        return "footwear";

      case "tops":
      case "shirts":
      case "tees":
      case "t-shirts":
        return "tops";

      case "bottoms":
      case "pants":
      case "shorts":
      case "leggings":
        return "bottoms";

      case "outerwear":
      case "jackets":
      case "hoodies":
      case "sweaters":
        return "outerwear";

      case "accessories":
      case "socks":
      case "hats":
      case "bags":
        return "accessories";

      case "running":
        return "road-running";

      case "trail running":
        return "trail-running";

      default:
        // If product_type doesn't match, fall back to title/tags
        break;
    }
  }

  // Fallback: Search in title and tags
  const searchText = `${title} ${tags || ""}`.toLowerCase();

  // Trail running shoes
  if (searchText.includes("trail") && searchText.includes("shoes")) {
    return "trail-running";
  }
  if (searchText.includes("trail") && searchText.includes("running")) {
    return "trail-running";
  }

  // Road running shoes
  if (searchText.includes("road") && searchText.includes("shoes")) {
    return "road-running";
  }
  if (
    searchText.includes("running") &&
    searchText.includes("shoes") &&
    !searchText.includes("trail")
  ) {
    return "road-running";
  }

  // General footwear categories
  if (searchText.includes("shoes") || searchText.includes("sneakers")) {
    return "footwear";
  }
  if (searchText.includes("boots")) {
    return "footwear";
  }
  if (searchText.includes("sandals")) {
    return "footwear";
  }

  // Apparel categories
  if (
    searchText.includes("shirt") ||
    searchText.includes("tee") ||
    searchText.includes("top")
  ) {
    return "tops";
  }
  if (
    searchText.includes("pants") ||
    searchText.includes("shorts") ||
    searchText.includes("leggings")
  ) {
    return "bottoms";
  }
  if (
    searchText.includes("jacket") ||
    searchText.includes("hoodie") ||
    searchText.includes("sweater")
  ) {
    return "outerwear";
  }

  // Accessories
  if (searchText.includes("hat") || searchText.includes("cap")) {
    return "accessories";
  }
  if (searchText.includes("socks")) {
    return "accessories";
  }
  if (searchText.includes("bag") || searchText.includes("pack")) {
    return "accessories";
  }

  // Check tags for category hints
  if (tags) {
    const tagList = tags
      .toLowerCase()
      .split(",")
      .map((tag) => tag.trim());

    if (tagList.includes("running")) return "road-running";
    if (tagList.includes("trail")) return "trail-running";
    if (tagList.includes("footwear")) return "footwear";
    if (tagList.includes("apparel")) return "tops";
  }

  return null;
}

// Helper function to find or create category in Sanity
export async function getOrCreateCategory(
  categorySlug: string,
  categoryTitle: string
): Promise<string | null> {
  try {
    // First, try to find existing category by slug
    let category = await webhookSanityClient.fetch(
      `*[_type == "category" && slug.current == $slug][0]`,
      { slug: categorySlug }
    );

    if (category) {
      console.log("📂 Found existing category:", category._id);
      return category._id;
    }

    // If not found, create new category
    console.log("📂 Creating new category:", categoryTitle);
    category = await webhookSanityClient.create({
      _type: "category",
      title: categoryTitle,
      slug: {
        _type: "slug",
        current: categorySlug,
      },
      categoryType: "main", // Default to main category
      visibility: {
        navigation: true,
        filters: true,
      },
      featured: false,
      sortOrder: 0,
    });

    console.log("✅ Created new category:", category._id);
    return category._id;
  } catch (error) {
    console.error("❌ Error finding/creating category:", error);
    return null;
  }
}
