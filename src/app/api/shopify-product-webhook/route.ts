import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { createHash } from "crypto";
import {
  webhookSanityClient,
  createOptimizedImageUrl,
  generateImageFilename,
  isValidImageUrl,
  getImageDimensions,
} from "@/lib/shopify-webhook-utils";

// Sanity client
const sanityClient = webhookSanityClient;

// Shopify client configuration
const SHOPIFY_STORE = process.env.SHOPIFY_STORE || "zone2run";
const SHOPIFY_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN!;
const SHOPIFY_API_VERSION = "2023-10";

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  tags: string;
  images: Array<{
    id: number;
    src: string;
    alt: string;
    width: number;
    height: number;
  }>;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string;
    inventory_quantity: number;
  }>;
}

interface SanityImageAsset {
  _id: string;
  url: string;
  metadata: {
    dimensions: {
      width: number;
      height: number;
    };
  };
}

// Helper function to download and upload image to Sanity
async function downloadAndUploadImage(
  imageUrl: string,
  alt: string = "",
  productId: string,
  index: number = 0
): Promise<string | null> {
  try {
    // Validate image URL
    if (!isValidImageUrl(imageUrl)) {
      console.error(`Invalid image URL: ${imageUrl}`);
      return null;
    }

    // Create optimized image URL
    const optimizedUrl = createOptimizedImageUrl(imageUrl);

    // Download image
    const response = await fetch(optimizedUrl);
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const imageData = Buffer.from(imageBuffer);

    // Get image dimensions
    const dimensions = await getImageDimensions(optimizedUrl);

    // Create a unique filename
    const filename = generateImageFilename(imageUrl, productId, index);

    // Upload to Sanity
    const asset = await sanityClient.assets.upload("image", imageData, {
      filename: filename,
      title: alt || "Product Image",
    });

    return asset._id;
  } catch (error) {
    console.error("Error downloading/uploading image:", error);
    return null;
  }
}

// Helper function to extract gender from title, tags, and product type
function extractGender(
  title: string,
  tags: string,
  productType: string
): string {
  const titleLower = title.toLowerCase();
  const tagsLower = tags.toLowerCase();
  const productTypeLower = productType.toLowerCase();

  // Check title first
  if (titleLower.includes("women's") || titleLower.includes("womens")) {
    return "womens";
  }
  if (titleLower.includes("men's") || titleLower.includes("mens")) {
    return "mens";
  }

  // Check tags
  if (tagsLower.includes("women's") || tagsLower.includes("womens")) {
    return "womens";
  }
  if (tagsLower.includes("men's") || tagsLower.includes("mens")) {
    return "mens";
  }

  // Check product type
  if (
    productTypeLower.includes("women's") ||
    productTypeLower.includes("womens")
  ) {
    return "womens";
  }
  if (productTypeLower.includes("men's") || productTypeLower.includes("mens")) {
    return "mens";
  }

  return "unisex";
}

// Helper function to map product type to category
async function mapProductTypeToCategory(
  productType: string
): Promise<string | null> {
  // This would need to be implemented based on your category structure
  // For now, return a default category
  const categoryMappings: Record<string, string> = {
    "T-shirts": "category-t-shirts",
    Shorts: "category-shorts",
    Jackets: "category-jackets",
    Shoes: "category-shoes",
    // Add more mappings as needed
  };

  return categoryMappings[productType] || "category-t-shirts";
}

// Helper function to get or create brand
async function getOrCreateBrand(vendor: string): Promise<string | null> {
  try {
    // First, try to find existing brand
    const existingBrands = await sanityClient.fetch(
      `*[_type == "brand" && name == $vendor][0]`,
      { vendor }
    );

    if (existingBrands) {
      return existingBrands._id;
    }

    // Create new brand if not found
    const brandDoc = {
      _type: "brand",
      name: vendor,
      slug: {
        _type: "slug",
        current: vendor.toLowerCase().replace(/\s+/g, "-"),
      },
    };

    const result = await sanityClient.create(brandDoc);
    return result._id;
  } catch (error) {
    console.error("Error getting/creating brand:", error);
    return null;
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json();
    const { topic, id } = webhook;

    console.log(`Received webhook: ${topic} for product ${id}`);

    switch (topic) {
      case "products/create":
      case "products/update":
        await handleProductCreateOrUpdate(webhook);
        break;

      case "products/delete":
        await handleProductDelete(webhook);
        break;

      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleProductCreateOrUpdate(webhook: any) {
  const product: ShopifyProduct = webhook;

  try {
    // Extract gender
    const gender = extractGender(
      product.title,
      product.tags,
      product.product_type
    );

    // Get or create brand
    const brandId = await getOrCreateBrand(product.vendor);
    if (!brandId) {
      throw new Error(`Failed to get/create brand: ${product.vendor}`);
    }

    // Map product type to category
    const categoryId = await mapProductTypeToCategory(product.product_type);

    // Download and upload images
    const imageAssets: string[] = [];
    if (product.images && product.images.length > 0) {
      console.log(
        `Processing ${product.images.length} images for product ${product.id}`
      );

      for (let i = 0; i < product.images.length; i++) {
        const image = product.images[i];
        const assetId = await downloadAndUploadImage(
          image.src,
          image.alt,
          product.id.toString(),
          i
        );
        if (assetId) {
          imageAssets.push(assetId);
        }
      }
    }

    // Create or update product document
    const productDoc = {
      _type: "product",
      shopifyId: product.id.toString(),
      title: product.title,
      handle: product.handle,
      gender: gender,
      brand: {
        _type: "reference",
        _ref: brandId,
      },
      category: categoryId
        ? {
            _type: "reference",
            _ref: categoryId,
          }
        : undefined,
      images: imageAssets.map((assetId) => ({
        _type: "reference",
        _ref: assetId,
      })),
      store: {
        _type: "shopifyProduct",
        id: product.id,
        title: product.title,
        handle: product.handle,
        vendor: product.vendor,
        productType: product.product_type,
        tags: product.tags,
        variants: product.variants.map((variant) => ({
          _type: "shopifyProductVariant",
          id: variant.id,
          title: variant.title,
          price: parseFloat(variant.price),
          sku: variant.sku,
          inventoryQuantity: variant.inventory_quantity,
        })),
      },
    };

    // Check if product already exists
    const existingProduct = await sanityClient.fetch(
      `*[_type == "product" && shopifyId == $shopifyId][0]`,
      { shopifyId: product.id.toString() }
    );

    if (existingProduct) {
      // Update existing product
      await sanityClient.patch(existingProduct._id).set(productDoc).commit();

      console.log(`Updated product: ${product.title}`);
    } else {
      // Create new product
      await sanityClient.create(productDoc);
      console.log(`Created product: ${product.title}`);
    }
  } catch (error) {
    console.error(`Error processing product ${product.id}:`, error);
    throw error;
  }
}

async function handleProductDelete(webhook: any) {
  const { id } = webhook;

  try {
    // Find and delete the product
    const product = await sanityClient.fetch(
      `*[_type == "product" && shopifyId == $shopifyId][0]`,
      { shopifyId: id.toString() }
    );

    if (product) {
      // Delete associated images first
      if (product.images) {
        for (const imageRef of product.images) {
          try {
            await sanityClient.delete(imageRef._ref);
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        }
      }

      // Delete the product
      await sanityClient.delete(product._id);
      console.log(`Deleted product: ${product.title}`);
    }
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
}
