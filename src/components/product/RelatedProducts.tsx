"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HomeProductGrid from "@/components/homepage/HomeProductGrid";
import { type SanityProduct } from "@/types/sanityProduct";
import useEmblaCarousel from "embla-carousel-react";
import { getBrandUrl } from "@/lib/utils/brandUrls";

interface RelatedProductsProps {
  products: SanityProduct[];
  brandName: string;
  brandSlug: string;
  displayType?: "grid" | "carousel";
}

function RelatedProducts({
  products,
  brandName,
  brandSlug,
  displayType = "carousel",
}: RelatedProductsProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const onSettle = () => setIsDragging(false);
    const onScroll = () => setIsDragging(true);

    emblaApi.on("settle", onSettle);
    emblaApi.on("scroll", onScroll);

    return () => {
      emblaApi.off("settle", onSettle);
      emblaApi.off("scroll", onScroll);
    };
  }, [emblaApi]);

  const handleProductClick = useCallback(
    (e: React.MouseEvent, handle: string) => {
      if (!isDragging) {
        router.push(`/products/${handle}`);
      }
    },
    [router, isDragging]
  );

  const handleBrandClick = useCallback(
    (e: React.MouseEvent, brandSlug?: string) => {
      e.stopPropagation();
      if (!isDragging && brandSlug) {
        router.push(getBrandUrl(brandSlug));
      }
    },
    [router, isDragging]
  );

  if (!products?.length) return null;

  return (
    <div className="ml-2 mt-10 mb-12 pr-4 w-full">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-black text-xl">More from {brandName}</h2>
        <button
          className="text-black text-sm hover:underline cursor-pointer"
          onClick={() => router.push(getBrandUrl(brandSlug))}
        >
          View All
        </button>
      </div>

      {displayType === "grid" ? (
        <HomeProductGrid products={products} />
      ) : (
        <div className="overflow-hidden -mx-2 px-2" ref={emblaRef}>
          <div className="flex gap-2">
            {products.map((product) => (
              <div
                key={product._id}
                className={`flex-shrink-0 w-[70vw] min-w-0 aspect-[3/4] flex flex-col cursor-pointer ${
                  isDragging ? "pointer-events-none" : ""
                }`}
                onClick={(e) => handleProductClick(e, product.handle)}
              >
                <div className="w-full h-full relative bg-gray-100">
                  {product.mainImage?.url && (
                    <Image
                      src={product.mainImage.url}
                      alt={product.mainImage.alt || product.title || "Product"}
                      fill
                      className="object-cover"
                      sizes="70vw"
                      draggable={false}
                    />
                  )}
                </div>
                <div className="mt-2 mb-10">
                  <p
                    className="text-base font-medium hover:underline cursor-pointer"
                    onClick={(e) => handleBrandClick(e, product.brand?.slug)}
                  >
                    {product.brand?.name}
                  </p>
                  <p className="text-base hover:underline cursor-pointer">
                    {product.title}
                  </p>
                  <p className="text-base mt-2">
                    {product.priceRange.minVariantPrice} SEK
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RelatedProducts;
