// lib/product/getAllProducts.ts
import { getAllProducts as getCombinedProducts } from "@/sanity/lib/getData";
import type { SanityProduct } from "@/types/sanityProduct";

export async function getAllProducts(): Promise<SanityProduct[]> {
  try {
    return await getCombinedProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
