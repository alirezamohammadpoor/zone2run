"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/types/sanityProduct";

interface BlogProductCardProps {
  product: SanityProduct & { selectedImage?: { url: string; alt: string } };
}

export default function BlogProductCard({ product }: BlogProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/${product.handle}`);
  };

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
            sizes="(max-width: 1280px) 50vw, 25vw"
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
          {hoverImage?.url && (
            <Image
              src={hoverImage.url}
              alt={hoverImage.alt || "Product"}
              fill
              sizes="(max-width: 1280px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </div>
      )}
      <div className="mt-2 mb-10">
        <p className="text-xs cursor-pointer font-medium">
          {product.brand?.name}
        </p>
        <p className="text-xs cursor-pointer line-clamp-1">{product.title}</p>
        <p className="text-xs mt-2">
          {product.priceRange.minVariantPrice} {"SEK"}
        </p>
      </div>
    </div>
  );
}
