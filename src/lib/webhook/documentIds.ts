/**
 * Document ID Utilities
 *
 * Consistent ID generation for Sanity documents synced from Shopify.
 * Uses predictable IDs to enable upsert operations.
 */

/**
 * Build a Sanity document ID for a Shopify product
 */
export function buildProductDocumentId(shopifyId: number): string {
  return `shopifyProduct-${shopifyId}`;
}

/**
 * Build a Sanity document ID for a Shopify collection
 */
export function buildCollectionDocumentId(shopifyId: number): string {
  return `shopifyCollection-${shopifyId}`;
}

/**
 * Extract numeric ID from a Shopify GID string
 * Example: "gid://shopify/Product/123456" → 123456
 */
export function idFromGid(gid: string): number {
  const parts = gid.split("/");
  const id = Number(parts[parts.length - 1]);
  return isNaN(id) ? 0 : id;
}

/**
 * Build a Shopify GID from a resource type and numeric ID
 */
export function buildGid(resourceType: "Product" | "Collection", id: number): string {
  return `gid://shopify/${resourceType}/${id}`;
}

/**
 * Generate a unique key for Sanity array items
 */
export function generateArrayKey(prefix: string, index: number): string {
  return `${prefix}-${index}-${Date.now()}`;
}
