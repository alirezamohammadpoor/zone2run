/**
 * Product Processor Module
 *
 * Handles Shopify product webhook events (create, update, delete).
 * Syncs product data from Shopify to Sanity.
 */

import type { SanityClient } from "@sanity/client";
import type {
  ShopifyProductPayload,
  SanityProductDocument,
  SanityReference,
  SanityImageAsset,
  ProcessingResult,
  FailedProductData,
} from "./types";
import { logger } from "./logger";
import { buildProductDocumentId, buildGid, generateArrayKey } from "./documentIds";
import {
  wasProductRecentlyProcessed,
  markProductProcessed,
  getProductLastProcessed,
} from "./deduplication";
import { findOrCreateBrand, brandMatchesVendor, findBrandByVendor } from "./brandMatcher";
import {
  extractGenderFromProduct,
  extractCategoryFromProduct,
  getOrCreateCategory,
  getProductCollections,
  getSanityCollectionsByShopifyIds,
  processProductImages,
  webhookSanityClient,
} from "@/lib/shopify-webhook-utils";

interface ProductProcessorOptions {
  webhookId: string | null;
  eventId: string | null;
}

/**
 * Process a product create webhook
 */
export async function processProductCreate(
  payload: ShopifyProductPayload,
  options: ProductProcessorOptions
): Promise<ProcessingResult> {
  const productId = payload.id.toString();
  const { title, vendor, tags } = payload;

  logger.productStart(productId, title, "create");

  // Check rate limiting
  if (wasProductRecentlyProcessed(productId)) {
    const lastProcessed = getProductLastProcessed(productId);
    logger.skipped("Product processed recently", {
      productId,
      lastProcessed: lastProcessed?.toISOString(),
    });
    return {
      success: true,
      message: "Product processed recently - skipping",
      productId,
      timestamp: new Date().toISOString(),
    };
  }

  markProductProcessed(productId);

  try {
    // Extract metadata
    const gender = extractGenderFromProduct(title, tags);
    logger.info("Extracted gender", { productId, gender, title });

    const categorySlug = extractCategoryFromProduct(title, payload.product_type, tags);
    logger.info("Extracted category", { productId, categorySlug, productType: payload.product_type });

    // Get collections
    const shopifyCollections = await getProductCollections(productId);
    logger.info("Fetched Shopify collections", {
      productId,
      count: shopifyCollections.length,
    });

    const sanityCollectionIds = await getSanityCollectionsByShopifyIds(
      shopifyCollections.map((c) => c.id.toString())
    );

    // Get or validate category
    let categoryId: string | null = null;
    if (categorySlug) {
      const categoryTitle = categorySlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      categoryId = await getOrCreateCategory(categorySlug, categoryTitle);
    }

    // Process images
    let mainImage: SanityImageAsset | null = null;
    let gallery: SanityImageAsset[] = [];

    if (payload.images && payload.images.length > 0) {
      logger.info("Processing images", { productId, count: payload.images.length });
      const imageData = await processProductImages(
        webhookSanityClient,
        payload.images,
        payload
      );
      mainImage = imageData.mainImage as SanityImageAsset | null;
      gallery = (imageData.gallery || []) as SanityImageAsset[];
      logger.success("Images processed", {
        productId,
        mainImage: !!mainImage,
        galleryCount: gallery.length,
      });
    }

    // Build product document
    const productDocument: SanityProductDocument = {
      _id: buildProductDocumentId(payload.id),
      _type: "product",
      store: {
        id: payload.id,
        gid: buildGid("Product", payload.id),
        title,
        handle: payload.handle,
        status: payload.status,
        vendor,
        productType: payload.product_type,
        tags,
        descriptionHtml: payload.body_html,
        createdAt: payload.created_at,
        updatedAt: payload.updated_at,
        isDeleted: false,
        priceRange: payload.variants
          ? {
              minVariantPrice: Math.min(
                ...payload.variants.map((v) => parseFloat(v.price))
              ),
              maxVariantPrice: Math.max(
                ...payload.variants.map((v) => parseFloat(v.price))
              ),
            }
          : undefined,
        previewImageUrl: payload.images?.[0]?.src,
      },
    };

    // Add optional fields
    if (gender) {
      productDocument.gender = gender;
    }

    if (sanityCollectionIds.length > 0) {
      productDocument.collections = sanityCollectionIds.map((id, index) => ({
        _ref: id,
        _key: generateArrayKey("collection", index),
      }));
    }

    if (shopifyCollections.length > 0) {
      productDocument.shopifyCollectionIds = shopifyCollections.map((c) =>
        c.id.toString()
      );
    }

    if (mainImage) {
      productDocument.mainImage = mainImage;
    }

    if (gallery.length > 0) {
      productDocument.gallery = gallery;
    }

    // Handle brand (required field)
    if (!vendor) {
      throw new Error("Product missing required vendor field");
    }

    const brand = await findOrCreateBrand(webhookSanityClient, vendor);
    productDocument.brand = { _ref: brand._id };

    // Handle category (required field)
    if (!categoryId) {
      throw new Error(
        `Product missing required category. ProductType: ${payload.product_type}, Title: ${title}`
      );
    }
    productDocument.category = { _ref: categoryId };

    // Validate required fields
    const missingFields: string[] = [];
    if (!gender) missingFields.push("gender");
    if (!mainImage) missingFields.push("mainImage");

    if (missingFields.length > 0) {
      throw new Error(
        `Product missing required fields: ${missingFields.join(", ")}. ProductId: ${productId}`
      );
    }

    // Create or update product
    const transaction = webhookSanityClient.transaction();

    const existingProduct = await webhookSanityClient.fetch(
      `*[_type == "product" && _id == $productId][0]`,
      { productId: productDocument._id }
    );

    if (existingProduct) {
      transaction.patch(productDocument._id, (patch) => patch.set(productDocument));
      logger.info("Updating existing product", { productId });
    } else {
      transaction.create(productDocument);
      logger.info("Creating new product", { productId });
    }

    await transaction.commit();

    logger.success("Product created successfully", { productId: productDocument._id });

    return {
      success: true,
      message: "Product processed successfully",
      productId,
      action: "products/create",
      processed: {
        gender,
        vendor,
        collections: sanityCollectionIds.length,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to create product", { productId, title }, error as Error);

    const failedProduct: FailedProductData = {
      productId,
      title,
      vendor,
      productType: payload.product_type,
      tags,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      webhookId: options.webhookId,
      eventId: options.eventId,
    };

    logger.error("Failed product export", failedProduct as unknown as Record<string, unknown>);

    return {
      success: false,
      error: "Product processing failed",
      message: errorMessage,
      productId,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Process a product update webhook
 */
export async function processProductUpdate(
  payload: ShopifyProductPayload,
  options: ProductProcessorOptions
): Promise<ProcessingResult> {
  const productId = payload.id.toString();
  const { title, vendor, tags } = payload;

  logger.productStart(productId, title, "update");

  // Check rate limiting
  if (wasProductRecentlyProcessed(productId)) {
    const lastProcessed = getProductLastProcessed(productId);
    logger.skipped("Product processed recently", {
      productId,
      lastProcessed: lastProcessed?.toISOString(),
    });
    return {
      success: true,
      message: "Product processed recently - skipping",
      productId,
      timestamp: new Date().toISOString(),
    };
  }

  markProductProcessed(productId);

  try {
    // Find existing product
    const sanityProduct = await webhookSanityClient.fetch<{
      _id: string;
      brand?: { _ref: string };
    } | null>(`*[_type == "product" && store.id == $shopifyId][0]`, {
      shopifyId: payload.id,
    });

    if (!sanityProduct) {
      logger.warn("Product not found in Sanity", { productId });
      return {
        success: false,
        message: "Product not found in Sanity",
        productId,
        timestamp: new Date().toISOString(),
      };
    }

    logger.info("Found Sanity product", { sanityId: sanityProduct._id });

    // Extract metadata
    const gender = extractGenderFromProduct(title, tags);
    const categorySlug = extractCategoryFromProduct(title, payload.product_type, tags);

    // Get collections
    const shopifyCollections = await getProductCollections(productId);
    const sanityCollectionIds = await getSanityCollectionsByShopifyIds(
      shopifyCollections.map((c) => c.id.toString())
    );

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (gender) {
      updateData.gender = gender;
    }

    // Handle category
    if (categorySlug) {
      const categoryTitle = categorySlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      const categoryId = await getOrCreateCategory(categorySlug, categoryTitle);
      if (categoryId) {
        updateData.category = { _ref: categoryId };
      }
    }

    // Handle brand
    if (vendor) {
      const currentBrandRef = sanityProduct.brand?._ref;
      let currentBrandName: string | null = null;

      if (currentBrandRef) {
        const currentBrand = await webhookSanityClient.fetch<{ name: string } | null>(
          `*[_id == $brandId][0] { name }`,
          { brandId: currentBrandRef }
        );
        currentBrandName = currentBrand?.name ?? null;
      }

      // Only update brand if it doesn't match vendor (preserve manual changes)
      if (!brandMatchesVendor(currentBrandName, vendor)) {
        const brand = await findBrandByVendor(webhookSanityClient, vendor);

        if (brand && currentBrandRef !== brand._id) {
          updateData.brand = { _ref: brand._id };
          logger.info("Updating brand", {
            from: currentBrandRef,
            to: brand._id,
          });
        } else if (!brand) {
          // Create new brand if not found
          const newBrand = await findOrCreateBrand(webhookSanityClient, vendor);
          updateData.brand = { _ref: newBrand._id };
        }
      } else {
        logger.info("Brand matches vendor, preserving", { currentBrandName, vendor });
      }
    }

    // Handle collections
    if (sanityCollectionIds.length > 0) {
      updateData.collections = sanityCollectionIds.map((id, index) => ({
        _ref: id,
        _key: generateArrayKey("collection", index),
      }));
    }

    if (shopifyCollections.length > 0) {
      updateData.shopifyCollectionIds = shopifyCollections.map((c) => c.id.toString());
    }

    // Process images
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

    // Apply updates
    if (Object.keys(updateData).length > 0) {
      await webhookSanityClient
        .patch(sanityProduct._id)
        .set(updateData)
        .commit();

      logger.success("Product updated", {
        productId: sanityProduct._id,
        fieldsUpdated: Object.keys(updateData),
      });
    } else {
      logger.info("No updates needed", { productId: sanityProduct._id });
    }

    return {
      success: true,
      message: "Product processed successfully",
      productId,
      action: "products/update",
      processed: {
        gender,
        vendor,
        collections: sanityCollectionIds.length,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to update product", { productId }, error as Error);

    return {
      success: false,
      error: "Product processing failed",
      message: errorMessage,
      productId,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Process a product webhook based on topic
 */
export async function processProductWebhook(
  topic: string,
  payload: ShopifyProductPayload,
  options: ProductProcessorOptions
): Promise<ProcessingResult> {
  switch (topic) {
    case "products/create":
      return processProductCreate(payload, options);
    case "products/update":
      return processProductUpdate(payload, options);
    case "products/delete":
      // Soft delete - mark as deleted in Sanity
      logger.info("Product delete webhook received", { productId: String(payload.id) });
      try {
        await webhookSanityClient
          .patch(buildProductDocumentId(payload.id))
          .set({ "store.isDeleted": true })
          .commit();
        return {
          success: true,
          message: "Product marked as deleted",
          productId: payload.id.toString(),
          action: topic,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
          productId: payload.id.toString(),
          timestamp: new Date().toISOString(),
        };
      }
    default:
      return {
        success: false,
        message: `Unknown product topic: ${topic}`,
        timestamp: new Date().toISOString(),
      };
  }
}
