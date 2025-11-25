import {
  getProductCollections,
  getCollectionProducts,
  extractGenderFromProduct,
  extractCategoryFromProduct,
  getOrCreateCategory,
  getSanityCollectionsByShopifyIds,
  webhookSanityClient,
  downloadImage,
  generateImageFilename,
  processProductImages,
} from "@/lib/shopify-webhook-utils";

export const runtime = "nodejs";

// Add these helper functions at the top of your route.ts file
function buildProductDocumentId(id: number): string {
  return `shopifyProduct-${id}`;
}

function buildCollectionDocumentId(id: number): string {
  return `shopifyCollection-${id}`;
}

function idFromGid(gid: string): number {
  const parts = gid.split("/");
  const id = Number(parts[parts.length - 1]);
  return isNaN(id) ? 0 : id;
}

// Helper function to find brand by vendor name (case-insensitive, handles variations)
async function findBrandByVendor(
  client: any,
  vendor: string
): Promise<any | null> {
  if (!vendor) return null;

  // Normalize vendor name for comparison (lowercase, trim)
  const normalizedVendor = vendor.toLowerCase().trim();

  // Try exact match first
  let brand = await client.fetch(
    `*[_type == "brand" && name == $vendorName][0]`,
    { vendorName: vendor }
  );

  if (brand) return brand;

  // Try case-insensitive exact match
  brand = await client.fetch(
    `*[_type == "brand" && lower(name) == $normalizedVendor][0]`,
    { normalizedVendor }
  );

  if (brand) return brand;

  // Try partial match - find brands where name contains vendor or vendor contains name
  // This handles cases like "SOAR" vs "Soar running"
  const allBrands = await client.fetch(`*[_type == "brand"] { _id, name }`);

  for (const b of allBrands) {
    const normalizedBrandName = (b.name || "").toLowerCase().trim();
    if (
      normalizedBrandName === normalizedVendor ||
      normalizedBrandName.includes(normalizedVendor) ||
      normalizedVendor.includes(normalizedBrandName)
    ) {
      return b;
    }
  }

  return null;
}

// ============================================
// IMAGE PROCESSING FUNCTIONS MOVED TO UTILS
// ============================================

// Simple in-memory cache to prevent duplicate processing
const processedWebhooks = new Map<string, number>();

export async function POST(request: Request) {
  // IMMEDIATE LOG - This should always appear
  console.log("🚨 WEBHOOK FUNCTION INVOKED", new Date().toISOString());

  try {
    console.log("=".repeat(80));
    console.log("🔔 EDGE WEBHOOK RECEIVED");
    console.log("Time:", new Date().toISOString());
    console.log("=".repeat(80));
    // Log all headers
    console.log("\n=== ALL HEADERS ===");
    request.headers.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // Check if this is a real Shopify request
    const userAgent = request.headers.get("user-agent");
    const isRealShopify = userAgent === "Shopify-Captain-Hook";
    const webhookId = request.headers.get("x-shopify-webhook-id");
    const eventId = request.headers.get("x-shopify-event-id");

    console.log("\n=== REQUEST INFO ===");
    console.log("User-Agent:", userAgent);
    console.log("Is Real Shopify:", isRealShopify);
    console.log("Webhook ID:", webhookId);
    console.log("Event ID:", eventId);
    console.log("Content-Type:", request.headers.get("content-type"));
    console.log("Content-Length:", request.headers.get("content-length"));

    // Check for duplicate webhook processing
    const webhookKey = `${webhookId}-${eventId}`;
    if (processedWebhooks.has(webhookKey)) {
      console.log("⚠️ DUPLICATE WEBHOOK DETECTED - Skipping processing");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Duplicate webhook - already processed",
          webhookId,
          eventId,
        }),
        { status: 200 }
      );
    }

    // Mark this webhook as processed
    processedWebhooks.set(webhookKey, Date.now());
    console.log("✅ New webhook - proceeding with processing");

    // Clean up old webhook keys to prevent memory leaks (keep last 100)
    if (processedWebhooks.size > 100) {
      const keysArray = Array.from(processedWebhooks.keys());
      const keysToDelete = keysArray.slice(0, keysArray.length - 100);
      keysToDelete.forEach((key) => processedWebhooks.delete(key));
      console.log("🧹 Cleaned up old webhook keys");
    }

    // Read body using simple text() method
    console.log("\n📦 Reading body using request.text()...");
    const text = await request.text();

    console.log("✅ Body read successfully!");
    console.log("Body length:", text.length, "bytes");
    console.log("\n📝 Body preview (first 500 chars):");
    console.log(text.substring(0, 500));

    if (!text || text.length === 0) {
      console.log("❌ Empty body received");
      return new Response(JSON.stringify({ error: "Empty body" }), {
        status: 400,
      });
    }

    // Parse JSON
    console.log("\n🔄 Parsing JSON...");
    let payload: any;

    try {
      payload = JSON.parse(text);
      console.log("✅ JSON parsed successfully!");
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
      });
    }

    // Determine webhook type and log appropriate data
    const topic = request.headers.get("x-shopify-topic");
    console.log("\n=== WEBHOOK TYPE ===");
    console.log("Topic:", topic);

    if (topic?.startsWith("products/")) {
      // Log product data
      console.log("\n=== PRODUCT DATA ===");
      console.log("Product ID:", payload.id);
      console.log("Title:", payload.title);
      console.log("Vendor:", payload.vendor);
      console.log("Product Type:", payload.product_type);
      console.log("Tags:", payload.tags);
      console.log("Status:", payload.status);

      if (payload.images) {
        console.log("Images:", payload.images.length);
      }

      if (payload.variants) {
        console.log("Variants:", payload.variants.length);
      }
    } else if (topic?.startsWith("collections/")) {
      // Log collection data
      console.log("\n=== COLLECTION DATA ===");
      console.log("Collection ID:", payload.id);
      console.log("Title:", payload.title);
      console.log("Handle:", payload.handle);
      console.log("Published:", payload.published_scope);
      console.log("Rules:", payload.rules?.length || 0);
      console.log("Body HTML:", payload.body_html ? "Present" : "Empty");
    } else {
      console.log("\n=== UNKNOWN WEBHOOK TYPE ===");
      console.log("Full payload:", JSON.stringify(payload, null, 2));
    }

    if (topic?.startsWith("products/")) {
      console.log("\n🔄 PROCESSING PRODUCT WEBHOOK...");

      // Extract basic data (outside try block so they're available in catch)
      const productId = payload.id?.toString() || "unknown";
      const title = payload.title || "unknown";
      const vendor = payload.vendor || "unknown";
      const tags = payload.tags || "";

      try {
        console.log("📦 Product Data:", { productId, title, vendor, tags });

        // Check if we've processed this product recently (within last 5 minutes)
        const productKey = `product-${productId}`;
        const now = Date.now();
        const lastProcessed = processedWebhooks.get(productKey);

        if (lastProcessed && now - lastProcessed < 5 * 60 * 1000) {
          // 5 minutes
          console.log(
            "⚠️ Product processed recently - Skipping to prevent loops"
          );
          return new Response(
            JSON.stringify({
              success: true,
              message: "Product processed recently - skipping",
              productId,
              lastProcessed: new Date(lastProcessed).toISOString(),
            }),
            { status: 200 }
          );
        }

        // Mark this product as processed
        processedWebhooks.set(productKey, now);

        // Extract gender from title and tags
        const gender = extractGenderFromProduct(title, tags);
        console.log(
          "👤 Extracted Gender:",
          gender,
          "from title:",
          title,
          "tags:",
          tags
        );

        // Extract category from product data
        const categorySlug = extractCategoryFromProduct(
          title,
          payload.product_type,
          tags
        );
        console.log(
          "📂 Extracted Category Slug:",
          categorySlug,
          "from product_type:",
          payload.product_type
        );

        // Get collections for this product
        console.log("🔍 Fetching collections from Shopify API...");
        const shopifyCollections = await getProductCollections(productId);
        console.log("📚 Shopify Collections:", shopifyCollections);

        // Map to Sanity collection IDs
        const sanityCollectionIds = await getSanityCollectionsByShopifyIds(
          shopifyCollections.map((c) => c.id.toString())
        );
        console.log("🎯 Sanity Collection IDs:", sanityCollectionIds);

        // Get or create category
        let categoryId = null;
        if (categorySlug) {
          const categoryTitle = categorySlug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          categoryId = await getOrCreateCategory(categorySlug, categoryTitle);
          console.log("📂 Category ID:", categoryId);

          // Log products with missing categories
          if (!categoryId) {
            const fs = require("fs");
            const logEntry = {
              productId,
              title,
              vendor,
              productType: payload.product_type,
              extractedSlug: categorySlug,
              extractedTitle: categoryTitle,
              tags,
              timestamp: new Date().toISOString(),
            };

            const logFile = "products-missing-categories.json";
            let existingLogs = [];

            try {
              if (fs.existsSync(logFile)) {
                existingLogs = JSON.parse(fs.readFileSync(logFile, "utf8"));
              }
            } catch (e) {
              existingLogs = [];
            }

            existingLogs.push(logEntry);
            fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));
            console.log(`⚠️ Logged to ${logFile}`);
          }
        }

        // Handle product creation vs update
        if (topic === "products/create") {
          console.log("🆕 CREATING NEW PRODUCT...");

          // Process product images
          let mainImage = null;
          let gallery: any[] = [];

          if (payload.images && payload.images.length > 0) {
            console.log("🖼️ Processing product images...");
            const imageData = await processProductImages(
              webhookSanityClient,
              payload.images,
              payload
            );
            mainImage = imageData.mainImage;
            gallery = imageData.gallery;
            console.log(
              `✅ Processed ${gallery.length + (mainImage ? 1 : 0)} images`
            );
          }

          // Create new product document using gist patterns
          const productDocument = {
            _id: buildProductDocumentId(parseInt(productId)),
            _type: "product",
            store: {
              id: parseInt(productId),
              gid: `gid://shopify/Product/${productId}`,
              title: title,
              handle: payload.handle,
              status: payload.status,
              vendor: vendor,
              productType: payload.product_type,
              tags: tags,
              descriptionHtml: payload.body_html,
              createdAt: payload.created_at,
              updatedAt: payload.updated_at,
              isDeleted: false,
              // Add price range if available
              priceRange: payload.variants
                ? {
                    minVariantPrice: Math.min(
                      ...payload.variants.map((v: any) => parseFloat(v.price))
                    ),
                    maxVariantPrice: Math.max(
                      ...payload.variants.map((v: any) => parseFloat(v.price))
                    ),
                  }
                : undefined,
              // Add first image if available
              previewImageUrl: payload.images?.[0]?.src,
            },
            // Custom fields - fail if required fields are missing
            ...(gender && { gender }),
            ...(sanityCollectionIds.length > 0 && {
              collections: sanityCollectionIds.map((id, index) => ({
                _ref: id,
                _key: `collection-${index}-${Date.now()}`,
              })),
            }),
            ...(shopifyCollections.length > 0 && {
              shopifyCollectionIds: shopifyCollections.map((c) =>
                c.id.toString()
              ),
            }),
            // Include image fields
            ...(mainImage && { mainImage }),
            ...(gallery.length > 0 && { gallery }),
            // Category and brand will be added after creation
          };

          // Handle brand creation BEFORE transaction (required field)
          if (vendor) {
            try {
              let brand = await findBrandByVendor(webhookSanityClient, vendor);

              if (!brand) {
                // Create new brand
                brand = await webhookSanityClient.create({
                  _type: "brand",
                  name: vendor,
                  slug: {
                    current: vendor.toLowerCase().replace(/\s+/g, "-"),
                  },
                });
                console.log("📝 Created new brand:", brand._id);
              } else {
                console.log("📝 Found existing brand:", brand._id);
              }

              // Add brand reference to product document BEFORE commit
              (productDocument as any).brand = { _ref: brand._id };
            } catch (error) {
              console.error("❌ Error handling brand:", error);
              throw new Error(
                `Failed to create/find brand for vendor: ${vendor}`
              );
            }
          } else {
            throw new Error("Product missing required vendor field");
          }

          // Handle category assignment BEFORE transaction (required field)
          if (categoryId) {
            (productDocument as any).category = { _ref: categoryId };
            console.log("📂 Added category reference to product:", categoryId);
          } else {
            throw new Error(
              `Product missing required category field. Product type: ${payload.product_type}, Title: ${title}`
            );
          }

          // Validate required fields
          const missingFields = [];
          if (!gender) missingFields.push("gender");
          if (!mainImage) missingFields.push("mainImage");
          if (!payload.images || payload.images.length === 0)
            missingFields.push("images");

          if (missingFields.length > 0) {
            throw new Error(
              `Product missing required fields: ${missingFields.join(
                ", "
              )}. Product ID: ${productId}`
            );
          }

          // Create the product using transaction pattern from gist
          const transaction = webhookSanityClient.transaction();

          // Check if product already exists
          const existingProduct = await webhookSanityClient.fetch(
            `*[_type == "product" && _id == $productId][0]`,
            { productId: productDocument._id }
          );

          if (existingProduct) {
            // Update existing product with all fields
            transaction.patch(productDocument._id, (patch) =>
              patch.set(productDocument)
            );
            console.log("🔄 Updating existing product with all fields");
          } else {
            // Create new product
            transaction.create(productDocument);
            console.log("🆕 Creating new product");
          }

          await transaction.commit();

          console.log(
            "✅ New product created successfully:",
            productDocument._id
          );
        } else if (topic === "products/update") {
          console.log("🔄 UPDATING EXISTING PRODUCT...");

          // Your existing update logic (keep this as is)
          const sanityProduct = await webhookSanityClient.fetch(
            `*[_type == "product" && store.id == $shopifyId][0]`,
            { shopifyId: parseInt(productId) }
          );

          if (sanityProduct) {
            console.log("📝 Found Sanity product:", sanityProduct._id);

            // Process updated product images
            if (payload.images && payload.images.length > 0) {
              console.log("🖼️ Processing updated product images...");
              const imageData = await processProductImages(
                webhookSanityClient,
                payload.images,
                payload
              );
              console.log(
                `✅ Processed ${
                  imageData.gallery.length + (imageData.mainImage ? 1 : 0)
                } updated images`
              );
            }

            // Update the product with new data
            const updateData: any = {};

            if (gender) {
              updateData.gender = gender;
            }

            // Handle category assignment
            if (categorySlug) {
              const categoryTitle = categorySlug
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
              const categoryId = await getOrCreateCategory(
                categorySlug,
                categoryTitle
              );
              if (categoryId) {
                updateData.category = { _ref: categoryId };
                console.log("📂 Updated category reference:", categoryId);
              }
            }

            if (vendor) {
              // Find or create brand from vendor
              try {
                // Check if product already has a brand assigned
                const currentBrandRef = sanityProduct?.brand?._ref;
                let currentBrandName = null;

                if (currentBrandRef) {
                  // Fetch current brand to check its name
                  const currentBrand = await webhookSanityClient.fetch(
                    `*[_id == $brandId][0] { _id, name }`,
                    { brandId: currentBrandRef }
                  );
                  currentBrandName = currentBrand?.name;
                }

                // Normalize vendor and current brand name for comparison
                const normalizedVendor = vendor.toLowerCase().trim();
                const normalizedCurrentBrand = currentBrandName
                  ?.toLowerCase()
                  .trim();

                // Check if current brand name matches vendor (case-insensitive) or is a variation
                // This preserves manual brand name changes (e.g., "SOAR" vs "Soar running")
                const brandMatchesVendor =
                  currentBrandName &&
                  (normalizedCurrentBrand === normalizedVendor ||
                    normalizedCurrentBrand.includes(normalizedVendor) ||
                    normalizedVendor.includes(normalizedCurrentBrand));

                if (brandMatchesVendor) {
                  console.log(
                    `ℹ️ Brand name matches vendor (${currentBrandName} ~= ${vendor}), preserving manual change`
                  );
                } else {
                  // Find or create brand
                  let brand = await findBrandByVendor(
                    webhookSanityClient,
                    vendor
                  );

                  if (!brand) {
                    // Create new brand
                    brand = await webhookSanityClient.create({
                      _type: "brand",
                      name: vendor,
                      slug: {
                        current: vendor.toLowerCase().replace(/\s+/g, "-"),
                      },
                    });
                    console.log("📝 Created new brand:", brand._id);
                  } else {
                    console.log("📝 Found existing brand:", brand._id);
                  }

                  // Only update if brand changed
                  if (currentBrandRef !== brand._id) {
                    updateData.brand = { _ref: brand._id };
                    console.log(
                      `🔄 Updating brand from ${currentBrandRef} to ${brand._id}`
                    );
                  } else {
                    console.log("ℹ️ Brand unchanged, skipping update");
                  }
                }
              } catch (error) {
                console.error("❌ Error handling brand:", error);
              }
            }

            if (sanityCollectionIds.length > 0) {
              updateData.collections = sanityCollectionIds.map((id, index) => ({
                _ref: id,
                _key: `collection-${index}-${Date.now()}`,
              }));
            }

            // Store raw Shopify collection IDs for debugging
            if (shopifyCollections.length > 0) {
              updateData.shopifyCollectionIds = shopifyCollections.map((c) =>
                c.id.toString()
              );
            }

            // Process images for updates
            if (payload.images && payload.images.length > 0) {
              const imageData = await processProductImages(
                webhookSanityClient,
                payload.images,
                payload
              );
              if (imageData.mainImage) {
                updateData.mainImage = imageData.mainImage;
              }
              if (imageData.gallery.length > 0) {
                updateData.gallery = imageData.gallery;
              }
            }

            if (Object.keys(updateData).length > 0) {
              await webhookSanityClient
                .patch(sanityProduct._id)
                .set(updateData)
                .commit();

              console.log(
                "✅ Sanity product updated successfully:",
                updateData
              );
            } else {
              console.log("ℹ️ No updates needed for Sanity product");
            }
          } else {
            console.log(
              "⚠️ Sanity product not found for Shopify ID:",
              productId
            );
          }
        }

        console.log("✅ Product processing completed");

        // Return success response
        return new Response(
          JSON.stringify({
            success: true,
            message: "Product processed successfully",
            productId,
            action: topic,
            processed: {
              gender,
              vendor,
              collections: sanityCollectionIds.length,
            },
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("❌ Error processing product webhook:", error);

        // Export failed product data for debugging
        const failedProduct = {
          productId,
          title,
          vendor,
          productType: payload.product_type,
          tags,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
          webhookId: request.headers.get("x-shopify-webhook-id"),
          eventId: request.headers.get("x-shopify-event-id"),
        };

        console.log(
          "🚨 FAILED PRODUCT EXPORT:",
          JSON.stringify(failedProduct, null, 2)
        );

        return new Response(
          JSON.stringify({
            success: false,
            error: "Product processing failed",
            message: error instanceof Error ? error.message : "Unknown error",
            failedProduct,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else if (topic?.startsWith("collections/")) {
      console.log("\n🔄 PROCESSING COLLECTION WEBHOOK...");

      try {
        // Extract basic data
        const collectionId = payload.id.toString();
        const title = payload.title;
        const handle = payload.handle;
        const descriptionHtml = payload.body_html;
        const imageUrl = payload.image?.src;
        const rules = payload.rules;
        const sortOrder = payload.sort_order;
        const disjunctive = payload.disjunctive;

        console.log("📚 Collection Data:", {
          collectionId,
          title,
          handle,
          descriptionHtml: descriptionHtml ? "Present" : "Empty",
          imageUrl: imageUrl ? "Present" : "None",
          rules: rules?.length || 0,
          sortOrder,
          disjunctive,
        });

        // Check if we've processed this collection recently (within last 5 minutes)
        const collectionKey = `collection-${collectionId}`;
        const now = Date.now();
        const lastProcessed = processedWebhooks.get(collectionKey);

        if (lastProcessed && now - lastProcessed < 5 * 60 * 1000) {
          // 5 minutes
          console.log(
            "⚠️ Collection processed recently - Skipping to prevent loops"
          );
          return new Response(
            JSON.stringify({
              success: true,
              message: "Collection processed recently - skipping",
              collectionId,
              lastProcessed: new Date(lastProcessed).toISOString(),
            }),
            { status: 200 }
          );
        }

        // Mark this collection as processed
        processedWebhooks.set(collectionKey, now);

        // Handle collection creation vs update
        if (topic === "collections/create") {
          console.log("🆕 CREATING NEW COLLECTION...");

          // Create new collection document using gist patterns
          const collectionDocument = {
            _id: buildCollectionDocumentId(parseInt(collectionId)),
            _type: "collection",
            store: {
              id: parseInt(collectionId),
              gid: `gid://shopify/Collection/${collectionId}`,
              title: title,
              handle: handle,
              descriptionHtml: descriptionHtml,
              imageUrl: imageUrl,
              rules:
                rules?.map((rule: any, index: number) => ({
                  _key: `rule-${index}-${Date.now()}`,
                  _type: "object",
                  column: rule.column?.toUpperCase() as Uppercase<string>,
                  condition: rule.condition,
                  relation: rule.relation?.toUpperCase() as Uppercase<string>,
                })) || [],
              disjunctive: disjunctive,
              sortOrder:
                sortOrder?.toUpperCase().replace("-", "_") || "UNKNOWN",
              slug: {
                _type: "slug",
                current: handle,
              },
              createdAt: payload.created_at,
              updatedAt: payload.updated_at,
              isDeleted: false,
            },
            // Custom fields
            featured: false,
            sortOrder: 0,
            isActive: true,
          };

          // Create the collection using transaction pattern from gist
          const transaction = webhookSanityClient.transaction();
          transaction.createIfNotExists(collectionDocument);
          await transaction.commit();

          console.log(
            "✅ New collection created successfully:",
            collectionDocument._id
          );

          // Sync products from Shopify - get all products that belong to this collection
          console.log("🔍 Syncing products from Shopify collection...");

          // Get products from Shopify for this collection
          const shopifyProducts = await getCollectionProducts(collectionId);
          console.log(
            `📦 Found ${shopifyProducts.length} products in Shopify collection`
          );

          // Get Shopify product IDs that should be in this collection
          const shopifyProductIds = new Set(
            shopifyProducts.map((p) => p.id.toString())
          );

          if (shopifyProducts.length > 0) {
            // Find all products in Sanity that currently have this collection ID
            // (both those that should have it and those that shouldn't)
            const allProductsWithCollection = await webhookSanityClient.fetch(
              `*[_type == "product" && (store.id in $shopifyIds || (defined(shopifyCollectionIds) && $collectionIdStr in shopifyCollectionIds))] {
                _id,
                "shopifyId": store.id,
                collections[] { _ref },
                shopifyCollectionIds
              }`,
              {
                shopifyIds: shopifyProducts.map((p) => p.id),
                collectionIdStr: collectionId.toString(),
              }
            );

            console.log(
              `🎯 Found ${
                allProductsWithCollection.length
              } products to check (${
                shopifyProducts.length
              } should have collection, ${
                allProductsWithCollection.length - shopifyProducts.length
              } may need removal)`
            );

            // Batch update products using transaction
            const transaction = webhookSanityClient.transaction();
            let addedCount = 0;
            let removedCount = 0;

            for (const product of allProductsWithCollection) {
              const currentCollectionRefs =
                product.collections?.map((c: any) => c._ref) || [];
              const currentShopifyIds = product.shopifyCollectionIds || [];
              const productShopifyId = product.shopifyId?.toString();

              // Check if product should be in this collection
              const shouldHaveCollection =
                productShopifyId && shopifyProductIds.has(productShopifyId);
              const hasCollectionRef = currentCollectionRefs.includes(
                collectionDocument._id
              );
              const hasShopifyId = currentShopifyIds.includes(
                collectionId.toString()
              );

              if (shouldHaveCollection) {
                // Product should be in collection - add if missing
                if (!hasCollectionRef || !hasShopifyId) {
                  const newCollections = hasCollectionRef
                    ? currentCollectionRefs.map((ref: string, idx: number) => ({
                        _ref: ref,
                        _key: `collection-${ref}-${idx}`,
                      }))
                    : [...currentCollectionRefs, collectionDocument._id].map(
                        (ref: string, idx: number) => ({
                          _ref: ref,
                          _key: `collection-${ref}-${idx}`,
                        })
                      );

                  const newShopifyIds = hasShopifyId
                    ? currentShopifyIds
                    : [...currentShopifyIds, collectionId.toString()];

                  transaction.patch(product._id, (patch) =>
                    patch.set({
                      collections: newCollections,
                      shopifyCollectionIds: newShopifyIds,
                    })
                  );

                  addedCount++;
                }
              } else {
                // Product should NOT be in collection - remove if present
                if (hasCollectionRef || hasShopifyId) {
                  const newCollections = currentCollectionRefs
                    .filter((ref: string) => ref !== collectionDocument._id)
                    .map((ref: string, idx: number) => ({
                      _ref: ref,
                      _key: `collection-${ref}-${idx}`,
                    }));

                  const newShopifyIds = currentShopifyIds.filter(
                    (id: string) => id !== collectionId.toString()
                  );

                  transaction.patch(product._id, (patch) =>
                    patch.set({
                      collections: newCollections,
                      shopifyCollectionIds: newShopifyIds,
                    })
                  );

                  removedCount++;
                }
              }
            }

            if (addedCount > 0 || removedCount > 0) {
              await transaction.commit();
              console.log(
                `✅ Updated products: ${addedCount} added, ${removedCount} removed from collection`
              );
            } else {
              console.log(
                "ℹ️ All products already have correct collection references"
              );
            }
          } else {
            // No products in Shopify collection - remove from all products that have it
            const productsWithCollection = await webhookSanityClient.fetch(
              `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $collectionIdStr in shopifyCollectionIds))] {
                _id,
                collections[] { _ref },
                shopifyCollectionIds
              }`,
              {
                collectionId: collectionDocument._id,
                collectionIdStr: collectionId.toString(),
              }
            );

            if (productsWithCollection.length > 0) {
              const transaction = webhookSanityClient.transaction();

              for (const product of productsWithCollection) {
                const currentCollectionRefs =
                  product.collections?.map((c: any) => c._ref) || [];
                const currentShopifyIds = product.shopifyCollectionIds || [];

                const newCollections = currentCollectionRefs
                  .filter((ref: string) => ref !== collectionDocument._id)
                  .map((ref: string, idx: number) => ({
                    _ref: ref,
                    _key: `collection-${ref}-${idx}`,
                  }));

                const newShopifyIds = currentShopifyIds.filter(
                  (id: string) => id !== collectionId.toString()
                );

                transaction.patch(product._id, (patch) =>
                  patch.set({
                    collections: newCollections,
                    shopifyCollectionIds: newShopifyIds,
                  })
                );
              }

              await transaction.commit();
              console.log(
                `✅ Removed collection from ${productsWithCollection.length} products (collection is empty)`
              );
            } else {
              console.log("ℹ️ No products found in Shopify collection");
            }
          }
        } else if (topic === "collections/update") {
          console.log("🔄 UPDATING EXISTING COLLECTION...");

          // Find existing collection by Shopify ID
          const sanityCollection = await webhookSanityClient.fetch(
            `*[_type == "collection" && store.id == $shopifyId][0]`,
            { shopifyId: parseInt(collectionId) }
          );

          if (sanityCollection) {
            console.log("📝 Found Sanity collection:", sanityCollection._id);

            // Update the collection with new data
            const updateData: any = {};

            // Update store fields
            updateData.store = {
              ...sanityCollection.store,
              title: title,
              handle: handle,
              descriptionHtml: descriptionHtml,
              imageUrl: imageUrl,
              rules:
                rules?.map((rule: any, index: number) => ({
                  _key: `rule-${index}-${Date.now()}`,
                  _type: "object",
                  column: rule.column?.toUpperCase() as Uppercase<string>,
                  condition: rule.condition,
                  relation: rule.relation?.toUpperCase() as Uppercase<string>,
                })) || [],
              disjunctive: disjunctive,
              sortOrder:
                sortOrder?.toUpperCase().replace("-", "_") || "UNKNOWN",
              slug: {
                _type: "slug",
                current: handle,
              },
              updatedAt: payload.updated_at,
            };

            // Check if rules actually changed before syncing products
            const existingRules = sanityCollection.store?.rules || [];
            const rulesChanged =
              JSON.stringify(
                existingRules
                  .map((r: any) => ({
                    column: r.column,
                    relation: r.relation,
                    condition: r.condition,
                  }))
                  .sort()
              ) !==
              JSON.stringify(
                (rules || [])
                  .map((r: any) => ({
                    column: r.column?.toUpperCase(),
                    relation: r.relation?.toUpperCase(),
                    condition: r.condition,
                  }))
                  .sort()
              );

            if (Object.keys(updateData).length > 0) {
              await webhookSanityClient
                .patch(sanityCollection._id)
                .set(updateData)
                .commit();

              console.log(
                "✅ Sanity collection updated successfully:",
                updateData
              );
            } else {
              console.log("ℹ️ No updates needed for Sanity collection");
            }

            // Sync products from Shopify - get all products that belong to this collection
            // This works for both manual and smart collections
            if (
              rulesChanged ||
              !sanityCollection.store?.rules ||
              sanityCollection.store.rules.length === 0
            ) {
              console.log("🔍 Syncing products from Shopify collection...");

              // Get products from Shopify for this collection
              const shopifyProducts = await getCollectionProducts(collectionId);
              console.log(
                `📦 Found ${shopifyProducts.length} products in Shopify collection`
              );

              // Get Shopify product IDs that should be in this collection
              const shopifyProductIds = new Set(
                shopifyProducts.map((p) => p.id.toString())
              );

              if (shopifyProducts.length > 0) {
                // Find all products in Sanity that currently have this collection ID
                // (both those that should have it and those that shouldn't)
                const allProductsWithCollection =
                  await webhookSanityClient.fetch(
                    `*[_type == "product" && (store.id in $shopifyIds || (defined(shopifyCollectionIds) && $collectionIdStr in shopifyCollectionIds))] {
                    _id,
                    "shopifyId": store.id,
                    collections[] { _ref },
                    shopifyCollectionIds
                  }`,
                    {
                      shopifyIds: shopifyProducts.map((p) => p.id),
                      collectionIdStr: collectionId.toString(),
                    }
                  );

                console.log(
                  `🎯 Found ${
                    allProductsWithCollection.length
                  } products to check (${
                    shopifyProducts.length
                  } should have collection, ${
                    allProductsWithCollection.length - shopifyProducts.length
                  } may need removal)`
                );

                // Batch update products using transaction
                const transaction = webhookSanityClient.transaction();
                let addedCount = 0;
                let removedCount = 0;

                for (const product of allProductsWithCollection) {
                  const currentCollectionRefs =
                    product.collections?.map((c: any) => c._ref) || [];
                  const currentShopifyIds = product.shopifyCollectionIds || [];
                  const productShopifyId = product.shopifyId?.toString();

                  // Check if product should be in this collection
                  const shouldHaveCollection =
                    productShopifyId && shopifyProductIds.has(productShopifyId);
                  const hasCollectionRef = currentCollectionRefs.includes(
                    sanityCollection._id
                  );
                  const hasShopifyId = currentShopifyIds.includes(
                    collectionId.toString()
                  );

                  if (shouldHaveCollection) {
                    // Product should be in collection - add if missing
                    if (!hasCollectionRef || !hasShopifyId) {
                      const newCollections = hasCollectionRef
                        ? currentCollectionRefs.map(
                            (ref: string, idx: number) => ({
                              _ref: ref,
                              _key: `collection-${ref}-${idx}`,
                            })
                          )
                        : [...currentCollectionRefs, sanityCollection._id].map(
                            (ref: string, idx: number) => ({
                              _ref: ref,
                              _key: `collection-${ref}-${idx}`,
                            })
                          );

                      const newShopifyIds = hasShopifyId
                        ? currentShopifyIds
                        : [...currentShopifyIds, collectionId.toString()];

                      transaction.patch(product._id, (patch) =>
                        patch.set({
                          collections: newCollections,
                          shopifyCollectionIds: newShopifyIds,
                        })
                      );

                      addedCount++;
                    }
                  } else {
                    // Product should NOT be in collection - remove if present
                    if (hasCollectionRef || hasShopifyId) {
                      const newCollections = currentCollectionRefs
                        .filter((ref: string) => ref !== sanityCollection._id)
                        .map((ref: string, idx: number) => ({
                          _ref: ref,
                          _key: `collection-${ref}-${idx}`,
                        }));

                      const newShopifyIds = currentShopifyIds.filter(
                        (id: string) => id !== collectionId.toString()
                      );

                      transaction.patch(product._id, (patch) =>
                        patch.set({
                          collections: newCollections,
                          shopifyCollectionIds: newShopifyIds,
                        })
                      );

                      removedCount++;
                    }
                  }
                }

                if (addedCount > 0 || removedCount > 0) {
                  await transaction.commit();
                  console.log(
                    `✅ Updated products: ${addedCount} added, ${removedCount} removed from collection`
                  );
                } else {
                  console.log(
                    "ℹ️ All products already have correct collection references"
                  );
                }
              } else {
                // No products in Shopify collection - remove from all products that have it
                const productsWithCollection = await webhookSanityClient.fetch(
                  `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $collectionIdStr in shopifyCollectionIds))] {
                    _id,
                    collections[] { _ref },
                    shopifyCollectionIds
                  }`,
                  {
                    collectionId: sanityCollection._id,
                    collectionIdStr: collectionId.toString(),
                  }
                );

                if (productsWithCollection.length > 0) {
                  const transaction = webhookSanityClient.transaction();

                  for (const product of productsWithCollection) {
                    const currentCollectionRefs =
                      product.collections?.map((c: any) => c._ref) || [];
                    const currentShopifyIds =
                      product.shopifyCollectionIds || [];

                    const newCollections = currentCollectionRefs
                      .filter((ref: string) => ref !== sanityCollection._id)
                      .map((ref: string, idx: number) => ({
                        _ref: ref,
                        _key: `collection-${ref}-${idx}`,
                      }));

                    const newShopifyIds = currentShopifyIds.filter(
                      (id: string) => id !== collectionId.toString()
                    );

                    transaction.patch(product._id, (patch) =>
                      patch.set({
                        collections: newCollections,
                        shopifyCollectionIds: newShopifyIds,
                      })
                    );
                  }

                  await transaction.commit();
                  console.log(
                    `✅ Removed collection from ${productsWithCollection.length} products (collection is empty)`
                  );
                } else {
                  console.log("ℹ️ No products found in Shopify collection");
                }
              }
            } else {
              console.log(
                "ℹ️ Collection rules unchanged - skipping product sync"
              );
            }
          } else {
            console.log(
              "⚠️ Sanity collection not found for Shopify ID:",
              collectionId
            );
          }
        } else if (topic === "collections/delete") {
          console.log("🗑️ DELETING COLLECTION...");

          // Find existing collection by Shopify ID
          const sanityCollection = await webhookSanityClient.fetch(
            `*[_type == "collection" && store.id == $shopifyId][0]`,
            { shopifyId: parseInt(collectionId) }
          );

          if (sanityCollection) {
            console.log("📝 Found Sanity collection:", sanityCollection._id);

            // Find all products that reference this collection
            const productsWithCollection = await webhookSanityClient.fetch(
              `*[_type == "product" && references($collectionId)] {
                _id,
                collections[] { _ref },
                shopifyCollectionIds
              }`,
              { collectionId: sanityCollection._id }
            );

            console.log(
              `🔗 Found ${productsWithCollection.length} products referencing this collection`
            );

            // Remove collection reference from all products
            if (productsWithCollection.length > 0) {
              const transaction = webhookSanityClient.transaction();
              let updatedCount = 0;

              for (const product of productsWithCollection) {
                const currentCollectionRefs =
                  product.collections?.map((c: any) => c._ref) || [];
                const currentShopifyIds = product.shopifyCollectionIds || [];

                // Remove this collection from references
                const newCollections = currentCollectionRefs
                  .filter((ref: string) => ref !== sanityCollection._id)
                  .map((ref: string, idx: number) => ({
                    _ref: ref,
                    _key: `collection-${ref}-${idx}`,
                  }));

                // Remove from shopifyCollectionIds
                const newShopifyIds = currentShopifyIds.filter(
                  (id: string) => id !== collectionId.toString()
                );

                transaction.patch(product._id, (patch) =>
                  patch.set({
                    collections: newCollections,
                    shopifyCollectionIds: newShopifyIds,
                  })
                );

                updatedCount++;
              }

              if (updatedCount > 0) {
                await transaction.commit();
                console.log(
                  `✅ Removed collection reference from ${updatedCount} products`
                );
              }
            }

            // Soft delete the collection
            await webhookSanityClient
              .patch(sanityCollection._id)
              .set({ "store.isDeleted": true })
              .commit();

            console.log("✅ Collection marked as deleted");
          } else {
            console.log(
              "⚠️ Sanity collection not found for Shopify ID:",
              collectionId
            );
          }
        }

        console.log("✅ Collection processing completed");

        // Return success response
        return new Response(
          JSON.stringify({
            success: true,
            message: "Collection processed successfully",
            collectionId,
            action: topic,
            processed: {
              title,
              handle,
              rules: rules?.length || 0,
            },
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("❌ Error processing collection webhook:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Collection processing failed",
            message: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Fallback response for unknown topics
    return new Response(
      JSON.stringify({
        success: false,
        message: "Unknown webhook topic",
        topic: topic,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ CRITICAL ERROR IN WEBHOOK:", error);
    console.error("Error type:", typeof error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    console.error("=".repeat(80));

    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
