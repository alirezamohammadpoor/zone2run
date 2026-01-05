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

/**
 * Render a product card showing image(s), brand, title, and price with optional hover image and click handlers.
 *
 * @param product - Product data; may include `selectedImage`, `mainImage`, `gallery`, `brand`, `title`, `handle`, and `priceRange`.
 * @param sizes - Responsive image sizes attribute passed to Next.js Image (defaults to "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw").
 * @param className - Additional CSS classes applied to the root container.
 * @param onBrandClick - Optional handler invoked with a brand slug when the brand name is clicked.
 * @param onClick - Optional custom click handler for the entire card; if omitted, the card navigates to `/products/{product.handle}`.
 * @returns A JSX element representing the product card.
 */
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
  // Second image for hover effect (first gallery image, since mainImage is the primary)
  const hoverImage = product.gallery?.[0];

  return (
    <div
      className={`aspect-[4/5] flex flex-col hover:cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      {imageToUse?.url && (
        <div className="w-full h-full relative bg-gray-100">
          <Image
            src={imageToUse.url}
            alt={imageToUse.alt || product.title || "Product"}
            fill
            sizes={sizes}
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
            draggable={false}
          />
          {hoverImage?.url && (
            <Image
              src={hoverImage.url}
              alt={hoverImage.alt || product.title || "Product"}
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              draggable={false}
            />
          )}
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