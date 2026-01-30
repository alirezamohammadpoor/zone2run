"use client";

import Image from "next/image";
import { memo } from "react";
import dynamic from "next/dynamic";
import { getBlurProps } from "@/lib/utils/imageProps";

// Defer mobile carousel — keeps initial DOM small for LCP
const MobileCarousel = dynamic(() => import("./MobileCarousel"), {
  ssr: false,
});

interface ProductCardGalleryProps {
  images: Array<{ url: string; alt?: string; lqip?: string }>;
  sizes?: string;
  priority?: boolean;
  disableGallery?: boolean;
}

const ProductCardGallery = memo(function ProductCardGallery({
  images,
  sizes,
  priority = false,
  disableGallery = false,
}: ProductCardGalleryProps) {
  const mainImage = images[0];
  const hoverImage = images[1];
  const hasMultipleImages = images.length > 1;
  const showCarousel = !disableGallery && hasMultipleImages;

  // Static + desktop hover crossfade only
  if (!showCarousel) {
    return (
      <div
        className="w-full h-full relative group"
        aria-hidden="true"
      >
        {mainImage?.url && (
          <Image
            src={mainImage.url}
            alt=""
            fill
            sizes={sizes}
            className={`object-cover ${hoverImage?.url ? "transition-opacity duration-300 xl:group-hover:opacity-0" : ""}`}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            draggable={false}
            {...getBlurProps(mainImage)}
          />
        )}
        {hoverImage?.url && (
          <Image
            src={hoverImage.url}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-300 xl:group-hover:opacity-100"
            draggable={false}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative group"
      aria-hidden="true"
    >
      {/* Desktop: hover crossfade (hidden on mobile) */}
      <div className="hidden xl:block w-full h-full">
        {mainImage?.url && (
          <Image
            src={mainImage.url}
            alt=""
            fill
            sizes={sizes}
            className={`object-cover ${hoverImage?.url ? "transition-opacity duration-300 xl:group-hover:opacity-0" : ""}`}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            draggable={false}
            {...getBlurProps(mainImage)}
          />
        )}
        {hoverImage?.url && (
          <Image
            src={hoverImage.url}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-300 xl:group-hover:opacity-100"
            draggable={false}
          />
        )}
      </div>

      {/* Mobile: CSS scroll-snap carousel (hidden on desktop) */}
      <div className="xl:hidden w-full h-full">
        <MobileCarousel
          images={images}
          sizes={sizes}
          priority={priority}
        />
      </div>
    </div>
  );
});

export default ProductCardGallery;
