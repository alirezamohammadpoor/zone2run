/**
 * Utility functions for handling brand URLs
 * Ensures consistent encoding/decoding of brand slugs
 */

/**
 * Builds a brand URL path from a brand slug
 * Properly encodes special characters in the slug
 * @param brandSlug - The brand slug (may contain special characters)
 * @returns The brand URL path (e.g., "/brands/kl%C3%A4ttermusen")
 */
export function getBrandUrl(brandSlug: string): string {
  if (!brandSlug) return "/brands";
  
  // Encode the slug to handle special characters properly
  // Next.js Link will handle this, but being explicit ensures consistency
  const encodedSlug = encodeURIComponent(brandSlug);
  return `/brands/${encodedSlug}`;
}

/**
 * Decodes a brand slug from a URL parameter
 * @param urlSlug - The URL-encoded slug from the URL params
 * @returns The decoded slug (e.g., "klättermusen")
 */
export function decodeBrandSlug(urlSlug: string): string {
  try {
    return decodeURIComponent(urlSlug);
  } catch (error) {
    // If decoding fails, return the original slug
    console.warn("Failed to decode brand slug:", urlSlug);
    return urlSlug;
  }
}

