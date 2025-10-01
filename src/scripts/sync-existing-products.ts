import { createClient } from "@sanity/client";
import {
  webhookSanityClient,
  createOptimizedImageUrl,
  generateImageFilename,
  isValidImageUrl,
  getImageDimensions,
} from "../lib/shopify-webhook-utils";

// Sanity client
const sanityClient = webhookSanityClient;

// Shopify configuration
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

// Main sync function
async function syncExistingProducts() {
  try {
    console.log("🔄 Starting sync of existing products...");

    // Get all existing products from Sanity
    const existingProducts = await sanityClient.fetch(`
      *[_type == "product"] {
        _id,
        shopifyId,
        title,
        "vendor": store.vendor,
        "product_type": store.productType,
        "tags": store.tags,
        "images": store.images
      }
    `);

    console.log(`📦 Found ${existingProducts.length} existing products`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const product of existingProducts) {
      try {
        console.log(`\n🔄 Processing: ${product.title} (${product.shopifyId})`);

        // Extract gender
        const gender = extractGender(
          product.title,
          product.tags || "",
          product.product_type || ""
        );

        // Get or create brand
        const brandId = await getOrCreateBrand(product.vendor);
        if (!brandId) {
          console.log(`⚠️  Skipping - no brand for vendor: ${product.vendor}`);
          skipped++;
          continue;
        }

        // Process images if they exist and are Shopify URLs
        const imageAssets: string[] = [];
        if (product.images && product.images.length > 0) {
          console.log(`📸 Processing ${product.images.length} images...`);

          for (let i = 0; i < product.images.length; i++) {
            const image = product.images[i];

            // Only process if it's a Shopify URL (not already in Sanity)
            if (image.src && image.src.includes("cdn.shopify.com")) {
              const assetId = await downloadAndUploadImage(
                image.src,
                image.alt || "",
                product.shopifyId,
                i
              );
              if (assetId) {
                imageAssets.push(assetId);
              }
            }
          }
        }

        // Update product with new data
        const updateData: any = {
          gender: gender,
          brand: {
            _type: "reference",
            _ref: brandId,
          },
        };

        // Add images if we processed any
        if (imageAssets.length > 0) {
          updateData.images = imageAssets.map((assetId) => ({
            _type: "reference",
            _ref: assetId,
          }));
        }

        // Update the product
        await sanityClient.patch(product._id).set(updateData).commit();

        console.log(`✅ Updated: ${product.title} (gender: ${gender})`);
        updated++;
      } catch (error) {
        console.error(`❌ Error processing ${product.title}:`, error);
        skipped++;
      }

      processed++;

      // Add delay to avoid rate limits
      if (processed % 10 === 0) {
        console.log(
          `⏳ Processed ${processed}/${existingProducts.length} products...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n🎉 Sync completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   📦 Total: ${processed}`);
  } catch (error) {
    console.error("❌ Sync failed:", error);
  }
}

// Run the sync
if (require.main === module) {
  syncExistingProducts();
}

export { syncExistingProducts };
