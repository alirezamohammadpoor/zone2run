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

  return (
    <div
      className="w-full aspect-[3/4] flex flex-col hover:cursor-pointer"
      onClick={handleClick}
    >
      {imageToUse?.url && (
        <div className="w-full h-full relative bg-gray-100">
          <Image
            src={imageToUse.url}
            alt={imageToUse.alt || "Product"}
            fill
            sizes="(max-width: 1280px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="mt-2 mb-10">
        <p className="text-xs cursor-pointer font-medium">
          {product.brand?.name}
        </p>
        <p className="text-xs cursor-pointer">{product.title}</p>
        <p className="text-xs mt-2">
          {product.priceRange.minVariantPrice} {"SEK"}
        </p>
      </div>
    </div>
  );
}
