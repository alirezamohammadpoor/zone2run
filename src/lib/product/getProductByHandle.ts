// lib/product/getProductByHandle.ts
import { getSanityProductByHandle } from "@/sanity/lib/getData";
import {
  getShopifyProductByHandle,
  getAllShopifyHandles,
} from "@/lib/shopify/products";
import { createProduct, type Product } from "@/types/product";

export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  try {
    const [sanity, shopify] = await Promise.all([
      getSanityProductByHandle(handle),
      getShopifyProductByHandle(handle),
    ]);

    if (!sanity || !shopify) {
      // Try with distance-lab prefix if Shopify lookup failed
      if (sanity && !shopify && !handle.startsWith("distance-lab-")) {
        const shopifyWithPrefix = await getShopifyProductByHandle(
          `distance-lab-${handle}`
        );

        if (shopifyWithPrefix) {
          return createProduct(shopifyWithPrefix, sanity);
        }
      }

      console.warn("Missing product data for handle:", handle, {
        sanity: !!sanity,
        shopify: !!shopify,
      });
      return null;
    }

    return createProduct(shopify, sanity);
  } catch (error) {
    console.error("Error fetching combined product:", error);
    return null;
  }
}
