/**
 * Brand Matching Module
 *
 * Handles vendor → brand resolution with fuzzy matching.
 * Supports variations like "Arc'teryx" vs "Arcteryx", "Maison Kitsuné" vs "Maison Kitsune".
 */

import type { SanityClient } from "@sanity/client";
import type { SanityBrand, SanitySlug } from "./types";
import { logger } from "./logger";

/**
 * Normalize a string for comparison
 * Removes special characters, apostrophes, hyphens, etc.
 */
export function normalizeForMatching(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[''`´]/g, "") // Remove apostrophes and similar
    .replace(/[-–—]/g, "") // Remove hyphens and dashes
    .replace(/[^\w\s]/g, "") // Remove other special characters
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Find a brand by vendor name with fuzzy matching
 *
 * Matching priority:
 * 1. Exact match (case-sensitive)
 * 2. Case-insensitive exact match
 * 3. Normalized match (special characters removed)
 * 4. Partial match (one contains the other)
 */
export async function findBrandByVendor(
  client: SanityClient,
  vendor: string
): Promise<SanityBrand | null> {
  if (!vendor) return null;

  const normalizedVendor = vendor.toLowerCase().trim();
  const strippedVendor = normalizeForMatching(vendor);

  // Try exact match first
  let brand = await client.fetch<SanityBrand | null>(
    `*[_type == "brand" && name == $vendorName][0]`,
    { vendorName: vendor }
  );

  if (brand) {
    logger.debug("Brand exact match found", { vendor, brandId: brand._id });
    return brand;
  }

  // Try case-insensitive exact match
  brand = await client.fetch<SanityBrand | null>(
    `*[_type == "brand" && lower(name) == $normalizedVendor][0]`,
    { normalizedVendor }
  );

  if (brand) {
    logger.debug("Brand case-insensitive match found", {
      vendor,
      brandId: brand._id,
    });
    return brand;
  }

  // Try matching with special characters removed
  const allBrands = await client.fetch<Array<{ _id: string; name: string }>>(
    `*[_type == "brand"] { _id, name }`
  );

  for (const b of allBrands) {
    const normalizedBrandName = (b.name || "").toLowerCase().trim();
    const strippedBrandName = normalizeForMatching(b.name || "");

    // Check exact match after stripping special characters
    if (strippedBrandName === strippedVendor) {
      logger.info("Brand match found after normalization", {
        vendor,
        brandName: b.name,
      });
      return b as SanityBrand;
    }

    // Check partial match (original logic)
    if (
      normalizedBrandName === normalizedVendor ||
      normalizedBrandName.includes(normalizedVendor) ||
      normalizedVendor.includes(normalizedBrandName)
    ) {
      logger.debug("Brand partial match found", { vendor, brandName: b.name });
      return b as SanityBrand;
    }

    // Check partial match with stripped strings
    if (
      strippedBrandName.includes(strippedVendor) ||
      strippedVendor.includes(strippedBrandName)
    ) {
      logger.info("Brand partial match found after normalization", {
        vendor,
        brandName: b.name,
      });
      return b as SanityBrand;
    }
  }

  return null;
}

/**
 * Find or create a brand from a vendor name
 */
export async function findOrCreateBrand(
  client: SanityClient,
  vendor: string
): Promise<SanityBrand> {
  // Try to find existing brand
  const existingBrand = await findBrandByVendor(client, vendor);

  if (existingBrand) {
    logger.info("Found existing brand", { brandId: existingBrand._id, vendor });
    return existingBrand;
  }

  // Create new brand (Sanity auto-generates _id)
  const newBrand = await client.create({
    _type: "brand" as const,
    name: vendor,
    slug: {
      _type: "slug" as const,
      current: vendor.toLowerCase().replace(/\s+/g, "-"),
    },
  }) as SanityBrand;

  logger.info("Created new brand", { brandId: newBrand._id, vendor });
  return newBrand;
}

/**
 * Check if a brand name matches a vendor name
 * Used to preserve manual brand name changes in Sanity
 */
export function brandMatchesVendor(
  brandName: string | null | undefined,
  vendor: string
): boolean {
  if (!brandName) return false;

  const normalizedVendor = vendor.toLowerCase().trim();
  const normalizedBrand = brandName.toLowerCase().trim();

  return (
    normalizedBrand === normalizedVendor ||
    normalizedBrand.includes(normalizedVendor) ||
    normalizedVendor.includes(normalizedBrand)
  );
}
