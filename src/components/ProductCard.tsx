"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/types/sanityProduct";

interface ProductCardProps {
  product: SanityProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/item/${product.handle}`);
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
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="mt-2 mb-10">
        <p className="text-base font-medium">
          {product.brand?.name || product.vendor || "No brand"}
        </p>
        <p className="text-base h-14">{product.title}</p>
        <p className="text-base mt-2">
          {product.priceRange.minVariantPrice} {"SEK"}
        </p>
      </div>
    </div>
  );
}
