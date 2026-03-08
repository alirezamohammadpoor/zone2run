import { createHmac, timingSafeEqual } from "crypto";

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

/**
 * Verify Shopify webhook HMAC signature.
 * Compares the x-shopify-hmac-sha256 header against a computed HMAC of the raw body.
 * Uses timingSafeEqual to prevent timing attacks.
 */
export function verifyShopifyHmac(
  rawBody: string,
  hmacHeader: string | null
): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET || !hmacHeader) return false;

  const computed = createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}
