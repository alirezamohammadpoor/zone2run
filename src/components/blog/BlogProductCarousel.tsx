"use client";

import React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
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
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  const validProducts = products.filter((item) => item?.product);

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
            <a
              key={p._id || idx}
              href={p.handle ? `/products/${p.handle}` : "#"}
              className="group flex-shrink-0 w-[70vw] min-w-0 aspect-[3/4] flex flex-col cursor-pointer"
            >
              <div className="w-full h-full relative bg-gray-100">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 70vw, 33vw"
                  draggable={false}
                />
              </div>
              <div className="mt-2 mb-10">
                {p.brand?.name && (
                  <a
                    className="text-base font-medium hover:underline cursor-pointer"
                    href={p.brand?.slug ? getBrandUrl(p.brand.slug) : "#"}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.brand.name}
                  </a>
                )}
                <p className="text-base hover:underline cursor-pointer">
                  {p.title}
                </p>
                {p.priceRange?.minVariantPrice && (
                  <p className="text-base mt-2">
                    {p.priceRange.minVariantPrice} SEK
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
