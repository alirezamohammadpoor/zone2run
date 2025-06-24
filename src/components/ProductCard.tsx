"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: {
    _id: string;
    title?: string;
    shopifyHandle?: string;
    mainImage?: any;
    shortDescription?: string;
    category?: {
      title: string;
      slug: any;
    };
    brand?: {
      name: string;
      slug: any;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/${product.shopifyHandle}`);
  };

  return (
    <div
      className=" w-full aspect-[3/4] flex flex-col hover:cursor-pointer"
      onClick={handleClick}
    >
      {product.mainImage && (
        <div className="w-full h-full relative bg-gray-100">
          <Image
            src={urlFor(product.mainImage).url()}
            alt={product.title || "Product"}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="mt-2 mb-10">
        <p className="text-base font-medium">{product.brand?.name}</p>
        <p className="text-base">{product.title || "Untitled Product"}</p>
        <p className="text-base mt-2">1500 SEK</p>
      </div>
    </div>
  );
}
