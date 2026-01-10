/**
 * Webhook Module Barrel File
 *
 * Central export point for all webhook-related utilities.
 */

// Types
export * from "./types";

// Logger
export { logger } from "./logger";
export type { Logger } from "./logger";

// Document IDs
export {
  buildProductDocumentId,
  buildCollectionDocumentId,
  idFromGid,
  buildGid,
  generateArrayKey,
} from "./documentIds";

// Deduplication
export {
  isWebhookDuplicate,
  markWebhookProcessed,
  wasProductRecentlyProcessed,
  markProductProcessed,
  getProductLastProcessed,
  wasCollectionRecentlyProcessed,
  markCollectionProcessed,
  clearCache,
  getCacheSize,
} from "./deduplication";

// Brand Matching
export {
  normalizeForMatching,
  findBrandByVendor,
  findOrCreateBrand,
  brandMatchesVendor,
} from "./brandMatcher";

// Product Processing
export {
  processProductCreate,
  processProductUpdate,
  processProductWebhook,
} from "./productProcessor";

// Collection Processing
export {
  processCollectionCreate,
  processCollectionUpdate,
  processCollectionDelete,
  processCollectionWebhook,
} from "./collectionProcessor";
