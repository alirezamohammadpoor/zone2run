// lib/product/getAllProducts.ts
import { getAllProducts as getSanityProducts } from "@/sanity/lib/getData";
import { getShopifyProductByHandle } from "@/lib/shopify/products";
import { createProduct, type Product } from "@/types/product";

export async function getAllProducts(): Promise<Product[]> {
  try {
    const sanityProducts = await getSanityProducts();

    // Fetch Shopify data for each product
    const combinedProducts = await Promise.all(
      sanityProducts.map(async (sanityProduct) => {
        if (!sanityProduct.shopifyHandle) {
          return null;
        }

        // Try with distance-lab prefix if needed
        let shopifyProduct = await getShopifyProductByHandle(
          sanityProduct.shopifyHandle
        );

        if (
          !shopifyProduct &&
          !sanityProduct.shopifyHandle.startsWith("distance-lab-")
        ) {
          shopifyProduct = await getShopifyProductByHandle(
            `distance-lab-${sanityProduct.shopifyHandle}`
          );
        }

        if (!shopifyProduct) {
          console.warn(
            "Could not find Shopify product for handle:",
            sanityProduct.shopifyHandle
          );
          return null;
        }

        return createProduct(shopifyProduct, sanityProduct);
      })
    );

    // Filter out null results and deduplicate by Shopify handle
    const validProducts = combinedProducts.filter(
      (product): product is Product => product !== null
    );

    // Deduplicate by Shopify handle (keep the first occurrence)
    const seenHandles = new Set<string>();
    const uniqueProducts = validProducts.filter((product) => {
      const handle = product.shopify.handle;
      if (seenHandles.has(handle)) {
        console.warn("Duplicate product handle found:", handle);
        return false;
      }
      seenHandles.add(handle);
      return true;
    });

    return uniqueProducts;
  } catch (error) {
    console.error("Error fetching combined products:", error);
    return [];
  }
}
