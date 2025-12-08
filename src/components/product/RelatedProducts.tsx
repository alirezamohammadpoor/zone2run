"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
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
    (handle: string) => {
      if (!isDragging) {
        router.push(`/products/${handle}`);
      }
    },
    [router, isDragging]
  );

  const handleBrandClick = useCallback(
    (slug: string) => {
      if (!isDragging) {
        router.push(getBrandUrl(slug));
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
              <ProductCard
                key={product._id}
                product={product}
                className="flex-shrink-0 w-[70vw] aspect-[2/3]"
                sizes="70vw"
                onClick={() => handleProductClick(product.handle)}
                onBrandClick={handleBrandClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RelatedProducts;
