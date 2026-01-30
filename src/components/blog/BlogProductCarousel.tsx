"use client";

import { memo, useMemo } from "react";
import ProductCarousel from "@/components/ProductCarousel";
import { getSelectedImage } from "@/lib/utils/imageSelection";
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
      .map((item) => {
        const selected = getSelectedImage(item.product, item.imageSelection || "main");
        // Reorder: selected image first, then remaining
        const remaining = (item.product.images || [])
          .filter((img) => img.url !== selected.url);
        return {
          ...item.product,
          images: [selected, ...remaining],
        };
      });
  }, [products]);

  if (productsWithImages.length === 0) {
    return null;
  }

  return <ProductCarousel products={productsWithImages} />;
});

export default BlogProductCarousel;
