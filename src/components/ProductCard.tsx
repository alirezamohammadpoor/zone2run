"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/types/sanityProduct";
import { formatPrice } from "@/lib/utils/formatPrice";

interface ProductCardProps {
  product: SanityProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/${product.handle}`);
  };

  return (
    <div
      className=" w-full aspect-[3/4] flex flex-col hover:cursor-pointer"
      onClick={handleClick}
    >
      {product.mainImage?.url && (
        <div className="w-full h-full relative bg-gray-100">
          <Image
            src={product.mainImage.url}
            alt={product.mainImage.alt}
            fill
            sizes="50vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="mt-2 mb-4">
        <p className="text-base font-medium">
          {product.brand?.name || product.vendor || "No brand"}
        </p>
        <p className="text-base line-clamp-2 h-[3rem]">{product.title}</p>
      </div>
      <div>
        <p className="text-base mb-4">
          {formatPrice(product.priceRange.minVariantPrice)} {"SEK"}
        </p>
      </div>
    </div>
  );
}
