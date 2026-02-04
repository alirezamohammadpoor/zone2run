"use server";

import { enrichWithLocalePrices } from "@/lib/locale/enrichPrices";
import type { CardProduct } from "@/types/cardProduct";

/**
 * Server action: enrich recently viewed products with locale-aware Shopify prices.
 * Called from client component with the current country cookie.
 * Same pattern as search/PLP — hits Shopify @inContext for the user's country.
 */
export async function enrichRecentlyViewedPrices(
  products: CardProduct[],
  country: string,
): Promise<CardProduct[]> {
  if (!products.length || !country) return products;
  return enrichWithLocalePrices(products, country);
}
