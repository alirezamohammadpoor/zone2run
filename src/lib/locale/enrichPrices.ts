// Merges Shopify locale-aware prices into Sanity product data.
// Sanity = content (images, brand, categories, LQIP)
// Shopify = prices (via @inContext for the user's country)

import { getLocalizedPrices } from "@/lib/shopify/prices";

interface EnrichableProduct {
  handle: string;
  shopifyId?: string;
  priceRange: { minVariantPrice: number; currencyCode?: string; maxVariantPrice?: number };
}

/**
 * Enrich Sanity products with Shopify locale-aware prices.
 * Products without a shopifyId keep their original Sanity prices.
 */
export async function enrichWithLocalePrices<T extends EnrichableProduct>(
  products: T[],
  country: string,
): Promise<T[]> {
  const gids = products
    .map((p) => p.shopifyId)
    .filter((id): id is string => Boolean(id));

  if (gids.length === 0) return products;

  const priceMap = await getLocalizedPrices(gids, country);

  return products.map((product) => {
    const localePrice = priceMap.get(product.handle);
    if (!localePrice) return product;

    return {
      ...product,
      priceRange: {
        ...product.priceRange,
        minVariantPrice: localePrice.minVariantPrice.amount,
        maxVariantPrice: localePrice.maxVariantPrice.amount,
        currencyCode: localePrice.minVariantPrice.currencyCode,
      },
    };
  });
}
