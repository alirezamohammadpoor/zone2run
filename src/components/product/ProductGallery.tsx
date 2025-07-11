"use client";
import React from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface ProductGalleryProps {
  mainImage: any;
  title?: string;
}

function ProductGallery({ mainImage, title }: ProductGalleryProps) {
  return (
    <div className="w-full relative aspect-[5/5]  bg-gray-100 flex items-center justify-center">
      {mainImage && (
        <Image
          src={urlFor(mainImage).url()}
          alt={title || "Product"}
          fill
          className="object-contain"
        />
      )}
    </div>
  );
}

export default ProductGallery;
