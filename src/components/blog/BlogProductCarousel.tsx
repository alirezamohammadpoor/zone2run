"use client";

import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { SanityProduct } from "@/types/sanityProduct";

interface BlogProductCarouselProps {
  products: Array<{
    product: SanityProduct | undefined;
    imageSelection?: string;
  }>;
}

function getSelectedImage(
  product: SanityProduct | undefined,
  imageSelection: string
): { url: string; alt: string } | null {
  if (!product) return null;

  if (imageSelection === "main") {
    return {
      url: product.mainImage?.url || "",
      alt: product.mainImage?.alt || product.title || "Product",
    };
  }

  if (imageSelection.startsWith("gallery_")) {
    const i = parseInt(imageSelection.split("_")[1]);
    const selectedUrl = product.gallery?.[i]?.url;
    if (selectedUrl) {
      return {
        url: selectedUrl,
        alt: product.title || "Product",
      };
    }
  }

  return {
    url: product.mainImage?.url || "",
    alt: product.mainImage?.alt || product.title || "Product",
  };
}

const BlogProductCarousel = memo(function BlogProductCarousel({
  products,
}: BlogProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSettle = () => setIsDragging(false);
    const onScroll = () => setIsDragging(true);
    emblaApi.on("settle", onSettle).on("scroll", onScroll);
    return () => {
      emblaApi.off("settle", onSettle).off("scroll", onScroll);
    };
  }, [emblaApi]);

  const validProducts = useMemo(
    () => products.filter((item) => item?.product),
    [products]
  );

  const handleProductClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    },
    [isDragging]
  );

  if (validProducts.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden -mx-2 px-2" ref={emblaRef}>
      <div className="flex gap-2">
        {validProducts.map((item, idx) => {
          const p = item.product;
          if (!p) return null;

          const selection = item.imageSelection || "main";
          const selectedImage = getSelectedImage(p, selection);

          if (!selectedImage?.url) return null;

          return (
            <Link
              key={p._id || idx}
              href={`/products/${p.handle}`}
              onClick={handleProductClick}
              className={`cursor-pointer ${isDragging ? "pointer-events-none" : ""}`}
            >
              <ProductCard
                product={{
                  ...p,
                  selectedImage,
                }}
                className="flex-shrink-0 w-[70vw] min-w-0 xl:w-[30vw]"
                sizes="(max-width: 768px) 70vw, 33vw"
                disableGallery
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
});

export default BlogProductCarousel;
