// lib/product/getProductByHandle.ts
import { cache } from "react";
import { getSanityProductByHandle } from "@/sanity/lib/getData";
import type { SanityProduct } from "@/types/sanityProduct";

// React cache(): dedupes within same render pass
// generateMetadata and ProductPage both call this - only fetches once per request
export const getProductByHandle = cache(async function getProductByHandle(
  handle: string
): Promise<SanityProduct | null> {
  try {
    return await getSanityProductByHandle(handle);
  } catch (error) {
    console.error("Error fetching product by handle:", error);
    return null;
  }
});
