// lib/product/getProductByHandle.ts
import { getSanityProductByHandle } from "@/sanity/lib/getData";
import type { SanityProduct } from "@/types/sanityProduct";

export async function getProductByHandle(
  handle: string
): Promise<SanityProduct | null> {
  try {
    return await getSanityProductByHandle(handle);
  } catch (error) {
    console.error("Error fetching product by handle:", error);
    return null;
  }
}
