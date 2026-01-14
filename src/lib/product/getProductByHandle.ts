// lib/product/getProductByHandle.ts
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getSanityProductByHandle } from "@/sanity/lib/getData";
import type { SanityProduct } from "@/types/sanityProduct";

// unstable_cache: persists to disk/KV, survives across requests (ISR)
const getCachedProduct = unstable_cache(
  async (handle: string): Promise<SanityProduct | null> => {
    return getSanityProductByHandle(handle);
  },
  ["product-by-handle"],
  { revalidate: 300, tags: ["product"] }
);

// React cache(): dedupes within same render pass
// Both ProductContent and RelatedProductsSection call this - only fetches once
export const getProductByHandle = cache(async function getProductByHandle(
  handle: string
): Promise<SanityProduct | null> {
  try {
    return await getCachedProduct(handle);
  } catch (error) {
    console.error("Error fetching product by handle:", error);
    return null;
  }
});
