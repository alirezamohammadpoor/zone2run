// Batch price fetching with Shopify @inContext for locale-aware pricing
// Uses nodes(ids:) query — direct GID lookup, faster than text-based search

import shopifyClient from "@/lib/client";
import { DEFAULT_COUNTRY } from "@/lib/locale/countries";

export interface LocalizedPrice {
  minVariantPrice: { amount: number; currencyCode: string };
  maxVariantPrice: { amount: number; currencyCode: string };
}

interface ShopifyNodesResponse {
  nodes: Array<{
    id: string;
    handle: string;
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
      maxVariantPrice: { amount: string; currencyCode: string };
    };
  } | null>;
}

// 250 is Shopify's max IDs per nodes() query
const CHUNK_SIZE = 250;

const GET_LOCALIZED_PRICES = `
  query getLocalizedPrices($ids: [ID!]!, $country: CountryCode)
  @inContext(country: $country) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

/**
 * Batch fetch localized prices from Shopify using product GIDs.
 * Returns a Map keyed by product handle with locale-aware prices.
 *
 * @param shopifyGids - Array of Shopify Global IDs (gid://shopify/Product/...)
 * @param country - ISO 3166-1 alpha-2 country code (e.g. "DK", "GB")
 */
export async function getLocalizedPrices(
  shopifyGids: string[],
  country: string = DEFAULT_COUNTRY,
): Promise<Map<string, LocalizedPrice>> {
  const priceMap = new Map<string, LocalizedPrice>();

  if (shopifyGids.length === 0) return priceMap;

  // Chunk GIDs into groups of 250
  const chunks: string[][] = [];
  for (let i = 0; i < shopifyGids.length; i += CHUNK_SIZE) {
    chunks.push(shopifyGids.slice(i, i + CHUNK_SIZE));
  }

  try {
    const results = await Promise.all(
      chunks.map((ids) =>
        shopifyClient.request<ShopifyNodesResponse>(GET_LOCALIZED_PRICES, {
          ids,
          country,
        }),
      ),
    );

    for (const result of results) {
      for (const node of result.nodes) {
        if (!node?.handle || !node.priceRange) continue;
        priceMap.set(node.handle, {
          minVariantPrice: {
            amount: parseFloat(node.priceRange.minVariantPrice.amount),
            currencyCode: node.priceRange.minVariantPrice.currencyCode,
          },
          maxVariantPrice: {
            amount: parseFloat(node.priceRange.maxVariantPrice.amount),
            currencyCode: node.priceRange.maxVariantPrice.currencyCode,
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch localized prices from Shopify:", error);
  }

  return priceMap;
}
