"use client";

import { memo, useMemo } from "react";
import ProductCarousel from "@/components/ProductCarousel";
import { reorderProductImages } from "@/lib/utils/imageSelection";
import type { CardProduct } from "@/types/cardProduct";

interface BlogProductCarouselProps {
  products: Array<{
    product: CardProduct | undefined;
    imageSelection?: string;
  }>;
}

/**
 * Blog-specific wrapper for ProductCarousel.
 * Reorders product images so the selected image appears first.
 */
const BlogProductCarousel = memo(function BlogProductCarousel({
  products,
}: BlogProductCarouselProps) {
  const productsWithImages = useMemo(() => {
    return products
      .filter((item): item is { product: CardProduct; imageSelection?: string } =>
        item?.product != null
      )
      .map((item) => reorderProductImages(item.product, item.imageSelection || "main"));
  }, [products]);

  if (productsWithImages.length === 0) {
    return null;
  }

  return <ProductCarousel products={productsWithImages} />;
});

export default BlogProductCarousel;
