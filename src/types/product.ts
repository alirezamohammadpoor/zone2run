// lib/types/product.ts
import type { ShopifyProduct } from "./shopify";
import type { SanityProduct } from "./sanity";

export interface Product {
  // Core combined data
  shopify: ShopifyProduct;
  sanity: SanityProduct;
}
