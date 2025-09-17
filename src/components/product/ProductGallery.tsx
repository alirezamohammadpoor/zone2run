"use client";
import React from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { useState } from "react";

interface ProductGalleryProps {
  mainImage: any;
  galleryImages: any[] | null | undefined;
  title?: string;
}

function ProductGallery({
  mainImage,
  galleryImages,
  title,
}: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = useState(mainImage);

  // Step 1: Combine all images into one array
  const allImages = [mainImage, ...(galleryImages || [])].filter(Boolean);

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="w-full relative aspect-[4/5] flex items-center justify-center">
        {currentImage && (
          <Image
            src={urlFor(currentImage).url()}
            alt={title || "Product"}
            fill
            className="object-cover w-full h-full"
            priority
          />
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
