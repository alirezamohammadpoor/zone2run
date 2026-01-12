// lib/product/getProductByHandle.ts
import { cache } from "react";
import { getSanityProductByHandle } from "@/sanity/lib/getData";
import type { SanityProduct } from "@/types/sanityProduct";

/**
 * Cached product fetch - React's cache() deduplicates requests
 * within the same render cycle (generateMetadata + page component)
 */
export const getProductByHandle = cache(
  async (handle: string): Promise<SanityProduct | null> => {
    try {
      return await getSanityProductByHandle(handle);
    } catch (error) {
      console.error("Error fetching product by handle:", error);
      return null;
    }
  }
);
