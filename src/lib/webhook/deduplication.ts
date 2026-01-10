/**
 * Webhook Deduplication Module
 *
 * Prevents duplicate processing of webhooks and rate-limits product updates.
 *
 * Note: This uses in-memory storage which doesn't persist across deployments.
 * For production at scale, consider using:
 * - Vercel KV
 * - Redis
 * - Sanity document-based tracking
 */

import { logger } from "./logger";

// Configuration constants
const CONFIG = {
  /** Maximum number of webhook keys to keep in memory */
  MAX_CACHED_KEYS: 100,
  /** Time window to prevent duplicate processing (5 minutes) */
  DEDUP_WINDOW_MS: 5 * 60 * 1000,
} as const;

// In-memory cache for processed webhooks
const processedWebhooks = new Map<string, number>();

/**
 * Check if a webhook has already been processed
 */
export function isWebhookDuplicate(webhookId: string, eventId: string): boolean {
  const webhookKey = `${webhookId}-${eventId}`;
  return processedWebhooks.has(webhookKey);
}

/**
 * Mark a webhook as processed
 */
export function markWebhookProcessed(webhookId: string, eventId: string): void {
  const webhookKey = `${webhookId}-${eventId}`;
  processedWebhooks.set(webhookKey, Date.now());
  cleanupOldKeys();
}

/**
 * Check if a product was recently processed (within dedup window)
 */
export function wasProductRecentlyProcessed(productId: string): boolean {
  const productKey = `product-${productId}`;
  const lastProcessed = processedWebhooks.get(productKey);

  if (lastProcessed && Date.now() - lastProcessed < CONFIG.DEDUP_WINDOW_MS) {
    return true;
  }

  return false;
}

/**
 * Mark a product as processed
 */
export function markProductProcessed(productId: string): void {
  const productKey = `product-${productId}`;
  processedWebhooks.set(productKey, Date.now());
}

/**
 * Get the timestamp when a product was last processed
 */
export function getProductLastProcessed(productId: string): Date | null {
  const productKey = `product-${productId}`;
  const timestamp = processedWebhooks.get(productKey);
  return timestamp ? new Date(timestamp) : null;
}

/**
 * Check if a collection was recently processed
 */
export function wasCollectionRecentlyProcessed(collectionId: string): boolean {
  const collectionKey = `collection-${collectionId}`;
  const lastProcessed = processedWebhooks.get(collectionKey);

  if (lastProcessed && Date.now() - lastProcessed < CONFIG.DEDUP_WINDOW_MS) {
    return true;
  }

  return false;
}

/**
 * Mark a collection as processed
 */
export function markCollectionProcessed(collectionId: string): void {
  const collectionKey = `collection-${collectionId}`;
  processedWebhooks.set(collectionKey, Date.now());
}

/**
 * Clean up old keys to prevent memory leaks
 */
function cleanupOldKeys(): void {
  if (processedWebhooks.size <= CONFIG.MAX_CACHED_KEYS) {
    return;
  }

  const keysArray = Array.from(processedWebhooks.keys());
  const keysToDelete = keysArray.slice(0, keysArray.length - CONFIG.MAX_CACHED_KEYS);

  keysToDelete.forEach((key) => processedWebhooks.delete(key));

  logger.debug("Cleaned up old webhook keys", {
    deleted: keysToDelete.length,
    remaining: processedWebhooks.size,
  });
}

/**
 * Clear all cached keys (useful for testing)
 */
export function clearCache(): void {
  processedWebhooks.clear();
}

/**
 * Get current cache size (useful for monitoring)
 */
export function getCacheSize(): number {
  return processedWebhooks.size;
}
