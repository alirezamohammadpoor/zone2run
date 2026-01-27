"use client";

import React, { memo, useCallback } from "react";
import { formatPrice } from "@/lib/utils/formatPrice";
import ProductCardGallery from "./ProductCardGallery";

/**
 * Flexible product shape that works with both:
 * - Full SanityProduct (from product grids, search results)
 * - Minimal HomepageProduct (from homepage modules)
 */
interface ProductCardProduct {
  _id: string;
  handle: string;
  title: string;
  vendor: string;
  priceRange: { minVariantPrice: number };
  selectedImage?: { url: string; alt: string };
  gallery?: Array<{ url: string; alt?: string }>;
  // Full SanityProduct shape (brand as object)
  mainImage?: { url: string; alt: string };
  brand?: { name?: string; slug?: string };
  // Minimal HomepageProduct shape (brand as primitives)
  brandName?: string | null;
  brandSlug?: string | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
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

  // Support both SanityProduct (brand.name) and HomepageProduct (brandName)
  const brandName = product.brand?.name || product.brandName || product.vendor || "";
  const brandSlug = product.brand?.slug || product.brandSlug || undefined;
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
            onClick={(e) => handleBrandClick(e, brandSlug)}
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
