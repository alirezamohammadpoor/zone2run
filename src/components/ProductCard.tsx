"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
  onClick?: () => void;
  priority?: boolean;
  disableGallery?: boolean;
}

export default function ProductCard({
  product,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  className = "",
  onBrandClick,
  onClick,
  priority = false,
  disableGallery = false,
}: ProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/products/${product.handle}`);
    }
  };

  const handleBrandClick = (e: React.MouseEvent, slug?: string) => {
    if (onBrandClick && slug) {
      e.stopPropagation();
      onBrandClick(slug);
    }
  };

  // Build images array: selectedImage or mainImage first, then gallery
  const primaryImage = product.selectedImage || product.mainImage;
  const allImages = [
    primaryImage,
    ...(product.gallery || []),
  ].filter(
    (img): img is NonNullable<typeof img> => Boolean(img?.url)
  );

  return (
    <div className={`aspect-[4/5] flex flex-col hover:cursor-pointer ${className}`}>
      <div className="w-full h-full relative bg-gray-100">
        <ProductCardGallery
          images={allImages}
          sizes={sizes}
          priority={priority}
          onNavigate={handleClick}
          disableGallery={disableGallery}
        />
      </div>
      <div className="pt-2 pb-4">
        <p
          className={`text-xs font-medium ${
            onBrandClick ? "hover:underline cursor-pointer" : ""
          }`}
          onClick={(e) => handleBrandClick(e, product.brand?.slug)}
        >
          {product.brand?.name || product.vendor || ""}
        </p>
        <p className={`text-xs line-clamp-1 ${onBrandClick ? "hover:underline" : ""}`}>
          {product.title}
        </p>
        <p className="text-xs pt-2">
          {formatPrice(product.priceRange.minVariantPrice)} SEK
        </p>
      </div>
    </div>
  );
}
