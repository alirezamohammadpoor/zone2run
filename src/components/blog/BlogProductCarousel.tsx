"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getBrandUrl } from "@/lib/utils/brandUrls";
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

export default function BlogProductCarousel({
  products,
}: BlogProductCarouselProps) {
  const router = useRouter();
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  const validProducts = products.filter((item) => item?.product);

  if (validProducts.length === 0) {
    return null;
  }

  const handleBrandClick = (slug: string) => {
    router.push(getBrandUrl(slug));
  };

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
            <ProductCard
              key={p._id || idx}
              product={{
                ...p,
                selectedImage,
              }}
              className="flex-shrink-0 w-[70vw] min-w-0 xl:w-[30vw]"
              sizes="(max-width: 768px) 70vw, 33vw"
              onBrandClick={handleBrandClick}
            />
          );
        })}
      </div>
    </div>
  );
}
