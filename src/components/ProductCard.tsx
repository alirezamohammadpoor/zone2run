"use client";

import React, { memo, useCallback } from "react";
import type { SanityProduct } from "@/types/sanityProduct";
import { formatPrice } from "@/lib/utils/formatPrice";
import ProductCardGallery from "./ProductCardGallery";

interface ProductCardProps {
  product: SanityProduct & {
    selectedImage?: { url: string; alt: string };
  };
  sizes?: string;
  className?: string;
  onBrandClick?: (slug: string) => void;
  priority?: boolean;
  disableGallery?: boolean;
}

const ProductCard = memo(function ProductCard({
  product,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  className = "",
  onBrandClick,
  priority = false,
  disableGallery = false,
}: ProductCardProps) {
  const handleBrandClick = useCallback((e: React.MouseEvent, slug?: string) => {
    if (onBrandClick && slug) {
      e.stopPropagation();
      onBrandClick(slug);
    }
  }, [onBrandClick]);

  // Build images array: selectedImage or mainImage first, then gallery
  const primaryImage = product.selectedImage || product.mainImage;
  const allImages = [
    primaryImage,
    ...(product.gallery || []),
  ].filter(
    (img): img is NonNullable<typeof img> => Boolean(img?.url)
  );

  const brandName = product.brand?.name || product.vendor || "";
  const price = formatPrice(product.priceRange.minVariantPrice);

  return (
    <article className={`aspect-[4/5] flex flex-col ${className}`}>
      <div className="w-full h-full relative bg-gray-100 block">
        <ProductCardGallery
          images={allImages}
          sizes={sizes}
          priority={priority}
          disableGallery={disableGallery}
        />
      </div>
      <div className="pt-2 pb-4">
        {onBrandClick ? (
          <button
            type="button"
            className="text-xs font-medium hover:underline text-left"
            onClick={(e) => handleBrandClick(e, product.brand?.slug)}
          >
            {brandName}
          </button>
        ) : (
          <p className="text-xs font-medium">
            {brandName}
          </p>
        )}
        <p className="text-xs line-clamp-1">
          {product.title}
        </p>
        <p className="text-xs pt-2">
          {price} SEK
        </p>
      </div>
    </article>
  );
});

export default ProductCard;
