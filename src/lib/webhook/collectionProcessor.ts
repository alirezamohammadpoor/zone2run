/**
 * Collection Processor Module
 *
 * Handles Shopify collection webhook events (create, update, delete).
 * Syncs collection data and product memberships from Shopify to Sanity.
 */

import type { SanityClient } from "@sanity/client";
import type {
  ShopifyCollectionPayload,
  SanityCollectionDocument,
  ProcessingResult,
  ShopifyCollectionProduct,
} from "./types";
import { logger } from "./logger";
import { buildCollectionDocumentId, buildGid, generateArrayKey } from "./documentIds";
import {
  wasCollectionRecentlyProcessed,
  markCollectionProcessed,
} from "./deduplication";
import {
  getCollectionProducts,
  webhookSanityClient,
} from "@/lib/shopify-webhook-utils";

interface CollectionProcessorOptions {
  webhookId: string | null;
  eventId: string | null;
}

/**
 * Build a collection document from Shopify payload
 */
function buildCollectionDocument(
  payload: ShopifyCollectionPayload
): SanityCollectionDocument {
  const { id, title, handle, body_html, image, rules, sort_order, disjunctive } = payload;

  return {
    _id: buildCollectionDocumentId(id),
    _type: "collection",
    store: {
      id,
      gid: buildGid("Collection", id),
      title,
      handle,
      descriptionHtml: body_html,
      imageUrl: image?.src,
      rules:
        rules?.map((rule, index) => ({
          _key: generateArrayKey("rule", index),
          _type: "object",
          column: rule.column?.toUpperCase() ?? "",
          condition: rule.condition,
          relation: rule.relation?.toUpperCase() ?? "",
        })) || [],
      disjunctive,
      sortOrder: sort_order?.toUpperCase().replace("-", "_") || "UNKNOWN",
      slug: {
        _type: "slug",
        current: handle,
      },
      createdAt: payload.updated_at,
      updatedAt: payload.updated_at,
      isDeleted: false,
    },
    featured: false,
    sortOrder: 0,
    isActive: true,
  };
}

/**
 * Sync products to a collection
 * Adds/removes products based on Shopify collection membership
 */
async function syncCollectionProducts(
  collectionId: string,
  sanityCollectionId: string
): Promise<{ added: number; removed: number }> {
  logger.info("Syncing products for collection", { collectionId, sanityCollectionId });

  // Get products from Shopify
  const shopifyProducts = await getCollectionProducts(collectionId);
  logger.info("Found products in Shopify", {
    collectionId,
    count: shopifyProducts.length,
  });

  const shopifyProductIds = new Set(shopifyProducts.map((p) => p.id.toString()));

  if (shopifyProducts.length === 0) {
    // Remove collection from all products that have it
    return removeCollectionFromAllProducts(collectionId, sanityCollectionId);
  }

  // Find products that should have this collection or currently have it
  const allProductsWithCollection = await webhookSanityClient.fetch<
    Array<{
      _id: string;
      shopifyId: number;
      collections: Array<{ _ref: string }> | null;
      shopifyCollectionIds: string[] | null;
    }>
  >(
    `*[_type == "product" && (store.id in $shopifyIds || (defined(shopifyCollectionIds) && $collectionIdStr in shopifyCollectionIds))] {
      _id,
      "shopifyId": store.id,
      collections[] { _ref },
      shopifyCollectionIds
    }`,
    {
      shopifyIds: shopifyProducts.map((p) => p.id),
      collectionIdStr: collectionId,
    }
  );

  logger.info("Found products to check", {
    count: allProductsWithCollection.length,
    shouldHave: shopifyProducts.length,
  });

  // Batch update products
  const transaction = webhookSanityClient.transaction();
  let addedCount = 0;
  let removedCount = 0;

  for (const product of allProductsWithCollection) {
    const currentCollectionRefs = product.collections?.map((c) => c._ref) || [];
    const currentShopifyIds = product.shopifyCollectionIds || [];
    const productShopifyId = product.shopifyId?.toString();

    const shouldHaveCollection =
      productShopifyId && shopifyProductIds.has(productShopifyId);
    const hasCollectionRef = currentCollectionRefs.includes(sanityCollectionId);
    const hasShopifyId = currentShopifyIds.includes(collectionId);

    if (shouldHaveCollection) {
      // Add collection if missing
      if (!hasCollectionRef || !hasShopifyId) {
        const newCollections = hasCollectionRef
          ? currentCollectionRefs.map((ref, idx) => ({
              _ref: ref,
              _key: generateArrayKey("collection", idx),
            }))
          : [...currentCollectionRefs, sanityCollectionId].map((ref, idx) => ({
              _ref: ref,
              _key: generateArrayKey("collection", idx),
            }));

        const newShopifyIds = hasShopifyId
          ? currentShopifyIds
          : [...currentShopifyIds, collectionId];

        transaction.patch(product._id, (patch) =>
          patch.set({
            collections: newCollections,
            shopifyCollectionIds: newShopifyIds,
          })
        );

        addedCount++;
      }
    } else {
      // Remove collection if present
      if (hasCollectionRef || hasShopifyId) {
        const newCollections = currentCollectionRefs
          .filter((ref) => ref !== sanityCollectionId)
          .map((ref, idx) => ({
            _ref: ref,
            _key: generateArrayKey("collection", idx),
          }));

        const newShopifyIds = currentShopifyIds.filter((id) => id !== collectionId);

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
    logger.success("Product sync completed", { addedCount, removedCount });
  } else {
    logger.info("All products already have correct collection references");
  }

  return { added: addedCount, removed: removedCount };
}

/**
 * Remove a collection from all products that reference it
 */
async function removeCollectionFromAllProducts(
  collectionId: string,
  sanityCollectionId: string
): Promise<{ added: number; removed: number }> {
  const productsWithCollection = await webhookSanityClient.fetch<
    Array<{
      _id: string;
      collections: Array<{ _ref: string }> | null;
      shopifyCollectionIds: string[] | null;
    }>
  >(
    `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $collectionIdStr in shopifyCollectionIds))] {
      _id,
      collections[] { _ref },
      shopifyCollectionIds
    }`,
    {
      collectionId: sanityCollectionId,
      collectionIdStr: collectionId,
    }
  );

  if (productsWithCollection.length === 0) {
    logger.info("No products have this collection");
    return { added: 0, removed: 0 };
  }

  const transaction = webhookSanityClient.transaction();

  for (const product of productsWithCollection) {
    const currentCollectionRefs = product.collections?.map((c) => c._ref) || [];
    const currentShopifyIds = product.shopifyCollectionIds || [];

    const newCollections = currentCollectionRefs
      .filter((ref) => ref !== sanityCollectionId)
      .map((ref, idx) => ({
        _ref: ref,
        _key: generateArrayKey("collection", idx),
      }));

    const newShopifyIds = currentShopifyIds.filter((id) => id !== collectionId);

    transaction.patch(product._id, (patch) =>
      patch.set({
        collections: newCollections,
        shopifyCollectionIds: newShopifyIds,
      })
    );
  }

  await transaction.commit();
  logger.success("Removed collection from products", {
    count: productsWithCollection.length,
  });

  return { added: 0, removed: productsWithCollection.length };
}

/**
 * Process a collection create webhook
 */
export async function processCollectionCreate(
  payload: ShopifyCollectionPayload,
  options: CollectionProcessorOptions
): Promise<ProcessingResult> {
  const collectionId = payload.id.toString();
  const { title, handle } = payload;

  logger.collectionStart(collectionId, title, "create");

  // Check rate limiting
  if (wasCollectionRecentlyProcessed(collectionId)) {
    logger.skipped("Collection processed recently", { collectionId });
    return {
      success: true,
      message: "Collection processed recently - skipping",
      collectionId,
      timestamp: new Date().toISOString(),
    };
  }

  markCollectionProcessed(collectionId);

  try {
    // Build and create collection document
    const collectionDocument = buildCollectionDocument(payload);

    const transaction = webhookSanityClient.transaction();
    transaction.createIfNotExists(collectionDocument);
    await transaction.commit();

    logger.success("Collection created", { collectionId: collectionDocument._id });

    // Sync products
    const syncResult = await syncCollectionProducts(collectionId, collectionDocument._id);

    return {
      success: true,
      message: "Collection processed successfully",
      collectionId,
      action: "collections/create",
      processed: {
        title,
        handle,
        rules: payload.rules?.length || 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to create collection", { collectionId }, error as Error);
    return {
      success: false,
      error: "Collection processing failed",
      message: error instanceof Error ? error.message : "Unknown error",
      collectionId,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Process a collection update webhook
 */
export async function processCollectionUpdate(
  payload: ShopifyCollectionPayload,
  options: CollectionProcessorOptions
): Promise<ProcessingResult> {
  const collectionId = payload.id.toString();
  const { title, handle, rules, sort_order, disjunctive, body_html, image } = payload;

  logger.collectionStart(collectionId, title, "update");

  // Check rate limiting
  if (wasCollectionRecentlyProcessed(collectionId)) {
    logger.skipped("Collection processed recently", { collectionId });
    return {
      success: true,
      message: "Collection processed recently - skipping",
      collectionId,
      timestamp: new Date().toISOString(),
    };
  }

  markCollectionProcessed(collectionId);

  try {
    // Find existing collection
    const sanityCollection = await webhookSanityClient.fetch<{
      _id: string;
      store: { rules?: Array<{ column: string; relation: string; condition: string }> };
    } | null>(`*[_type == "collection" && store.id == $shopifyId][0]`, {
      shopifyId: payload.id,
    });

    if (!sanityCollection) {
      // Create collection if it doesn't exist
      logger.info("Collection not found, creating", { collectionId });
      return processCollectionCreate(payload, options);
    }

    logger.info("Found Sanity collection", { sanityId: sanityCollection._id });

    // Build update data
    const updateData = {
      store: {
        ...sanityCollection.store,
        title,
        handle,
        descriptionHtml: body_html,
        imageUrl: image?.src,
        rules:
          rules?.map((rule, index) => ({
            _key: generateArrayKey("rule", index),
            _type: "object",
            column: rule.column?.toUpperCase() ?? "",
            condition: rule.condition,
            relation: rule.relation?.toUpperCase() ?? "",
          })) || [],
        disjunctive,
        sortOrder: sort_order?.toUpperCase().replace("-", "_") || "UNKNOWN",
        slug: {
          _type: "slug",
          current: handle,
        },
        updatedAt: payload.updated_at,
      },
    };

    // Check if rules changed
    const existingRules = sanityCollection.store?.rules || [];
    const rulesChanged =
      JSON.stringify(
        existingRules
          .map((r) => ({
            column: r.column,
            relation: r.relation,
            condition: r.condition,
          }))
          .sort()
      ) !==
      JSON.stringify(
        (rules || [])
          .map((r) => ({
            column: r.column?.toUpperCase(),
            relation: r.relation?.toUpperCase(),
            condition: r.condition,
          }))
          .sort()
      );

    // Apply updates
    await webhookSanityClient
      .patch(sanityCollection._id)
      .set(updateData)
      .commit();

    logger.success("Collection updated", { collectionId: sanityCollection._id });

    // Check if products need syncing
    const productsInCollection = await webhookSanityClient.fetch<number>(
      `count(*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $collectionIdStr in shopifyCollectionIds))])`,
      {
        collectionId: sanityCollection._id,
        collectionIdStr: collectionId,
      }
    );

    const hasNoProducts = productsInCollection === 0;

    // Sync products if rules changed or no products exist
    if (rulesChanged || hasNoProducts) {
      if (hasNoProducts) {
        logger.info("Collection has no products, performing initial sync");
      }
      await syncCollectionProducts(collectionId, sanityCollection._id);
    } else {
      logger.info("Collection rules unchanged, skipping product sync");
    }

    return {
      success: true,
      message: "Collection processed successfully",
      collectionId,
      action: "collections/update",
      processed: {
        title,
        handle,
        rules: rules?.length || 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to update collection", { collectionId }, error as Error);
    return {
      success: false,
      error: "Collection processing failed",
      message: error instanceof Error ? error.message : "Unknown error",
      collectionId,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Process a collection delete webhook
 */
export async function processCollectionDelete(
  payload: ShopifyCollectionPayload,
  options: CollectionProcessorOptions
): Promise<ProcessingResult> {
  const collectionId = payload.id.toString();

  logger.collectionStart(collectionId, payload.title || "Unknown", "delete");

  try {
    // Find existing collection
    const sanityCollection = await webhookSanityClient.fetch<{ _id: string } | null>(
      `*[_type == "collection" && store.id == $shopifyId][0]`,
      { shopifyId: payload.id }
    );

    if (!sanityCollection) {
      logger.warn("Collection not found for deletion", { collectionId });
      return {
        success: true,
        message: "Collection not found",
        collectionId,
        timestamp: new Date().toISOString(),
      };
    }

    // Remove collection from all products
    await removeCollectionFromAllProducts(collectionId, sanityCollection._id);

    // Soft delete the collection
    await webhookSanityClient
      .patch(sanityCollection._id)
      .set({ "store.isDeleted": true })
      .commit();

    logger.success("Collection deleted", { collectionId: sanityCollection._id });

    return {
      success: true,
      message: "Collection deleted successfully",
      collectionId,
      action: "collections/delete",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to delete collection", { collectionId }, error as Error);
    return {
      success: false,
      error: "Collection processing failed",
      message: error instanceof Error ? error.message : "Unknown error",
      collectionId,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Process a collection webhook based on topic
 */
export async function processCollectionWebhook(
  topic: string,
  payload: ShopifyCollectionPayload,
  options: CollectionProcessorOptions
): Promise<ProcessingResult> {
  switch (topic) {
    case "collections/create":
      return processCollectionCreate(payload, options);
    case "collections/update":
      return processCollectionUpdate(payload, options);
    case "collections/delete":
      return processCollectionDelete(payload, options);
    default:
      return {
        success: false,
        message: `Unknown collection topic: ${topic}`,
        timestamp: new Date().toISOString(),
      };
  }
}
