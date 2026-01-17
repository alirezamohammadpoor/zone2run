"use client";

import React, { useCallback, useEffect, useState, memo } from "react";
import Link from "next/link";
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

const RelatedProducts = memo(function RelatedProducts({
  products,
  brandName,
  brandSlug,
  displayType = "carousel",
}: RelatedProductsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  // Handle embla carousel drag state
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
    (e: React.MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    },
    [isDragging]
  );

  if (!products?.length) return null;

  return (
    <div className="ml-2 my-8 md:my-12 xl:my-16 pr-2 w-full">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-black text-xl">More from {brandName}</h2>
        <Link
          href={getBrandUrl(brandSlug)}
          className="text-black text-sm hover:underline cursor-pointer"
        >
          View All
        </Link>
      </div>

      {displayType === "grid" ? (
        <HomeProductGrid products={products} />
      ) : (
        <div className="overflow-hidden -mx-2 px-2" ref={emblaRef}>
          <div className="flex gap-2">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product.handle}`}
                onClick={handleProductClick}
                className={`cursor-pointer ${isDragging ? "pointer-events-none" : ""}`}
              >
                <ProductCard
                  product={product}
                  className="flex-shrink-0 w-[70vw] xl:w-[30vw] aspect-[4/5]"
                  sizes="(min-width: 1280px) 25vw, 70vw"
                  disableGallery
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default RelatedProducts;
