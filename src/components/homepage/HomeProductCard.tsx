"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/types/sanityProduct";

interface HomeProductCardProps {
  product: SanityProduct & { selectedImage?: { url: string; alt: string } };
}

/**
 * Render a clickable product card showing a primary image (or selectedImage), an optional hover image, and product details.
 *
 * Clicking the card navigates to the product detail page at `/products/{product.handle}`.
 *
 * @param product - The product to render; may include `selectedImage` to override the main image and an optional `gallery` for the hover image.
 * @returns A React element representing the product card.
 */
export default function HomeProductCard({ product }: HomeProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/${product.handle}`);
  };

  // Use selectedImage if provided, otherwise fall back to mainImage
  const imageToUse = product.selectedImage || product.mainImage;
  // Second image for hover effect (first gallery image, since mainImage is the primary)
  const hoverImage = product.gallery?.[0];

  return (
    <div
      className="w-full aspect-[3/4] flex flex-col hover:cursor-pointer group"
      onClick={handleClick}
    >
      {imageToUse?.url && (
        <div className="w-full h-full relative bg-gray-100">
          <Image
            src={imageToUse.url}
            alt={imageToUse.alt || "Product"}
            fill
            sizes="50vw"
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
          {hoverImage?.url && (
            <Image
              src={hoverImage.url}
              alt={hoverImage.alt || "Product"}
              fill
              sizes="50vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </div>
      )}
      <div className="mt-2 mb-4">
        <p className="text-xs font-medium">{product.brand?.name}</p>
        <p className="text-xs line-clamp-1">{product.title}</p>
        <p className="text-xs mt-2">
          {product.priceRange.minVariantPrice} {"SEK"}
        </p>
      </div>
    </div>
  );
}