// lib/product/getProductByHandle.ts
import { unstable_cache } from "next/cache";
import { getSanityProductByHandle } from "@/sanity/lib/getData";
import type { SanityProduct } from "@/types/sanityProduct";

// unstable_cache persists across request boundaries (unlike React cache())
// This deduplicates fetches between generateMetadata() and ProductPage()
// Revalidates with page's ISR (300s) via revalidate tag
const getCachedProduct = unstable_cache(
  async (handle: string): Promise<SanityProduct | null> => {
    console.log(`[CACHE MISS] Fetching product: ${handle}`);
    return getSanityProductByHandle(handle);
  },
  ["product-by-handle"],
  { revalidate: 300, tags: ["product"] }
);

export async function getProductByHandle(
  handle: string
): Promise<SanityProduct | null> {
  try {
    return await getCachedProduct(handle);
  } catch (error) {
    console.error("Error fetching product by handle:", error);
    return null;
  }
}
