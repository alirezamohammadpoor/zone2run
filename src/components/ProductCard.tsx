"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/types/sanityProduct";
import { formatPrice } from "@/lib/utils/formatPrice";

interface ProductCardProps {
  product: SanityProduct & {
    selectedImage?: { url: string; alt: string };
  };
  sizes?: string;
  className?: string;
  onBrandClick?: (slug: string) => void;
  onClick?: () => void; // Custom click handler (for carousels with drag detection)
}

export default function ProductCard({
  product,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  className = "",
  onBrandClick,
  onClick,
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

  // Use selectedImage if provided, otherwise fall back to mainImage
  const imageToUse = product.selectedImage || product.mainImage;

  return (
    <div
      className={`aspect-[4/5] flex flex-col hover:cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {imageToUse?.url && (
        <div className="w-full h-full relative bg-gray-100">
          <Image
            src={imageToUse.url}
            alt={imageToUse.alt || product.title || "Product"}
            fill
            sizes={sizes}
            className="object-cover"
            draggable={false}
          />
        </div>
      )}
      <div className="pt-2 pb-4">
        <p
          className={`text-xs font-medium ${
            onBrandClick ? "hover:underline cursor-pointer" : ""
          }`}
          onClick={(e) => handleBrandClick(e, product.brand?.slug)}
        >
          {product.brand?.name || product.vendor || ""}
        </p>
        <p className={`text-xs ${onBrandClick ? "hover:underline" : ""}`}>
          {product.title}
        </p>
        <p className="text-xs pt-2">
          {formatPrice(product.priceRange.minVariantPrice)} SEK
        </p>
      </div>
    </div>
  );
}
