"use client";

import { memo, useMemo } from "react";
import ProductCarousel from "@/components/ProductCarousel";
import { getSelectedImage } from "@/lib/utils/imageSelection";
import type { SanityProduct } from "@/types/sanityProduct";

interface BlogProductCarouselProps {
  products: Array<{
    product: SanityProduct | undefined;
    imageSelection?: string;
  }>;
}

/**
 * Blog-specific wrapper for ProductCarousel.
 * Transforms { product, imageSelection }[] format into products with selectedImage.
 */
const BlogProductCarousel = memo(function BlogProductCarousel({
  products,
}: BlogProductCarouselProps) {
  const productsWithImages = useMemo(() => {
    return products
      .filter((item): item is { product: SanityProduct; imageSelection?: string } =>
        item?.product != null
      )
      .map((item) => ({
        ...item.product,
        selectedImage: getSelectedImage(item.product, item.imageSelection || "main"),
      }));
  }, [products]);

  if (productsWithImages.length === 0) {
    return null;
  }

  return <ProductCarousel products={productsWithImages} />;
});

export default BlogProductCarousel;
