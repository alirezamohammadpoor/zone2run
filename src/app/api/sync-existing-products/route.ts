import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import {
  getSanityCollectionsByShopifyIds,
  getProductCollections,
} from "@/lib/shopify-webhook-utils";

// Sanity client
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || "production",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
  apiVersion: "2023-05-03",
});

// Helper function to extract gender
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

export async function POST(request: NextRequest) {
  try {
    const { limit = 10, offset = 0 } = await request.json().catch(() => ({}));

    console.log(
      `🔄 Starting sync of existing products (limit: ${limit}, offset: ${offset})...`
    );

    // Get existing products from Sanity
    const existingProducts = await sanityClient.fetch(`
      *[_type == "product"] | order(_createdAt) [${offset}...${
      offset + limit
    }] {
        _id,
        "shopifyId": store.id,
        title,
        "vendor": store.vendor,
        "product_type": store.productType,
        "tags": store.tags
      }
    `);

    console.log(`📦 Found ${existingProducts.length} products to process`);

    let updated = 0;
    let skipped = 0;

    for (const product of existingProducts) {
      try {
        console.log(`🔄 Processing: ${product.title}`);

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

        // Sync collections from Shopify (manual collections)
        let collectionUpdates: any = {};
        if (product.shopifyId) {
          try {
            console.log(
              `🔍 Fetching collections for product ${product.shopifyId}...`
            );
            const shopifyCollections = await getProductCollections(
              product.shopifyId.toString()
            );
            console.log(
              `📚 Found ${shopifyCollections.length} manual collections from Shopify`
            );

            const allCollectionIds: string[] = [];
            const allShopifyIds: string[] = [];

            // Add manual collections
            if (shopifyCollections.length > 0) {
              const sanityCollectionIds = await getSanityCollectionsByShopifyIds(
                shopifyCollections.map((c) => c.id.toString())
              );
              console.log(
                `🎯 Mapped to ${sanityCollectionIds.length} Sanity collections`
              );
              allCollectionIds.push(...sanityCollectionIds);
              allShopifyIds.push(...shopifyCollections.map((c) => c.id.toString()));
            }

            // Also check smart collections by matching vendor
            if (product.vendor) {
              const smartCollections = await sanityClient.fetch(
                `*[_type == "collection" && defined(store.rules) && count(store.rules) > 0] {
                  _id,
                  "shopifyId": store.id,
                  "rules": store.rules
                }`
              );

              for (const collection of smartCollections) {
                const vendorRule = collection.rules?.find(
                  (r: any) => r.column?.toLowerCase() === "vendor"
                );

                if (
                  vendorRule?.condition &&
                  (product.vendor === vendorRule.condition ||
                    product.vendor.toLowerCase() === vendorRule.condition.toLowerCase())
                ) {
                  if (!allCollectionIds.includes(collection._id)) {
                    allCollectionIds.push(collection._id);
                  }
                  if (
                    collection.shopifyId &&
                    !allShopifyIds.includes(collection.shopifyId.toString())
                  ) {
                    allShopifyIds.push(collection.shopifyId.toString());
                  }
                }
              }

              if (smartCollections.length > 0) {
                console.log(
                  `🔍 Checked ${smartCollections.length} smart collections, matched ${allCollectionIds.length - (shopifyCollections.length || 0)} additional`
                );
              }
            }

            if (allCollectionIds.length > 0) {
              collectionUpdates.collections = allCollectionIds.map(
                (id, index) => ({
                  _ref: id,
                  _key: `collection-${index}-${Date.now()}`,
                })
              );
            }

            // Store raw Shopify collection IDs
            if (allShopifyIds.length > 0) {
              collectionUpdates.shopifyCollectionIds = allShopifyIds;
            }
          } catch (error) {
            console.error(
              `⚠️  Error syncing collections for ${product.title}:`,
              error
            );
          }
        }

        // Update product with gender, brand, and collections
        await sanityClient
          .patch(product._id)
          .set({
            gender: gender,
            brand: {
              _type: "reference",
              _ref: brandId,
            },
            ...collectionUpdates,
          })
          .commit();

        const collectionInfo =
          collectionUpdates.collections?.length > 0
            ? `, collections: ${collectionUpdates.collections.length}`
            : "";
        console.log(
          `✅ Updated: ${product.title} (gender: ${gender}${collectionInfo})`
        );
        updated++;
      } catch (error) {
        console.error(`❌ Error processing ${product.title}:`, error);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${existingProducts.length} products`,
      statistics: {
        updated,
        skipped,
        total: existingProducts.length,
      },
    });
  } catch (error) {
    console.error("❌ Sync failed:", error);
    return NextResponse.json(
      {
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get total count of products
    const totalProducts = await sanityClient.fetch(
      `count(*[_type == "product"])`
    );

    // Get products that need syncing (no gender or brand)
    const needsSync = await sanityClient.fetch(`
      count(*[_type == "product" && (!defined(gender) || !defined(brand))])
    `);

    return NextResponse.json({
      message: "Existing products sync status",
      statistics: {
        totalProducts,
        needsSync,
        synced: totalProducts - needsSync,
      },
      endpoints: {
        sync: "POST /api/sync-existing-products",
        test: "GET /api/test-webhook",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}
