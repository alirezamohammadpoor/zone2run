"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/lib/recentlyViewed/store";
import type { SanityProduct } from "@/types/sanityProduct";

/**
 * Tracks a product view in the recently viewed store.
 * Call this hook in the PDP component to record product views.
 */
export function useTrackRecentlyViewed(product: SanityProduct) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct);

  useEffect(() => {
    if (!product?.handle) return;

    addProduct({
      _id: product.handle,
      handle: product.handle,
      title: product.title,
      images: [{
        url: product.images?.[0]?.url || "",
        alt: product.images?.[0]?.alt,
      }],
      priceRange: {
        minVariantPrice: product.priceRange?.minVariantPrice || 0,
      },
      brand: product.brand
        ? {
            name: product.brand.name,
            slug: product.brand.slug,
          }
        : undefined,
      vendor: product.vendor,
    });
  }, [product.handle, addProduct]);
}
