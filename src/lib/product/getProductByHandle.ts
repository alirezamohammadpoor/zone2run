// lib/product/getProductByHandle.ts
import { cache } from "react";
import { getSanityProductByHandle } from "@/sanity/lib/getData";
import type { SanityProduct } from "@/types/sanityProduct";

// React cache() dedupes requests within a single render pass
// This prevents duplicate Sanity fetches between generateMetadata() and ProductPage()
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
