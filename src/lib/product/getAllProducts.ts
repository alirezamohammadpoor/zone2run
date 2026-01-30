// lib/product/getAllProducts.ts
import { getAllProducts as getCombinedProducts } from "@/sanity/lib/getData";
import type { PLPProduct } from "@/types/plpProduct";

export async function getAllProducts(): Promise<PLPProduct[]> {
  try {
    return await getCombinedProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
