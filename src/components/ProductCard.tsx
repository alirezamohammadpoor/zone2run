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
      className="w-full aspect-[1/1.05] bg-white rounded-lg overflow-hidden flex flex-col hover:cursor-pointer"
      onClick={handleClick}
    >
      {product.mainImage && (
        <div className="w-full h-4/5 relative">
          <Image
            src={urlFor(product.mainImage).url()}
            alt={product.title || "Product"}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-3">
        <p className="text-base">{product.brand?.name}</p>
        <p className="text-base">{product.title || "Untitled Product"}</p>
      </div>
    </div>
  );
}
