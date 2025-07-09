"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/${product.shopify.handle}`);
  };

  return (
    <div
      className=" w-full aspect-[3/4] flex flex-col hover:cursor-pointer"
      onClick={handleClick}
    >
      {product.sanity.mainImage && (
        <div className="w-full h-full relative bg-gray-100">
          <Image
            src={urlFor(product.sanity.mainImage).url()}
            alt={product.sanity.title || "Product"}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="mt-2 mb-10">
        <p className="text-base font-medium">{product.sanity.brand?.name}</p>
        <p className="text-base">
          {product.sanity.title || "Untitled Product"}
        </p>
        <p className="text-base mt-2">
          {product.shopify.priceRange.minVariantPrice.amount}{" "}
          {product.shopify.priceRange.minVariantPrice.currencyCode}
        </p>
      </div>
    </div>
  );
}
