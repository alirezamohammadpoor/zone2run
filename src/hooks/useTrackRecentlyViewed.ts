"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/lib/recentlyViewed/store";
import type { SanityProduct } from "@/types/sanityProduct";

/**
 * Tracks a product view in the recently viewed store.
 * Extracts CardProduct-compatible fields from the full SanityProduct.
 */
export function useTrackRecentlyViewed(product: SanityProduct) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct);

  useEffect(() => {
    if (!product?.handle) return;

    addProduct({
      _id: product._id,
      handle: product.handle,
      title: product.title,
      vendor: product.vendor,
      priceRange: {
        minVariantPrice: product.priceRange?.minVariantPrice || 0,
      },
      images: (product.images || []).map((img) => ({
        url: img.url,
        alt: img.alt,
      })),
      brand: product.brand
        ? { name: product.brand.name, slug: product.brand.slug }
        : undefined,
    });
  }, [product.handle, addProduct]);
}
