"use client";

import React, { useCallback, useRef, memo } from "react";
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

const RelatedProducts = memo(function RelatedProducts({
  products,
  brandName,
  brandSlug,
  displayType = "carousel",
}: RelatedProductsProps) {
  const router = useRouter();
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  // Track pointer position to detect actual dragging vs. taps
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);

  // Track pointer movement to distinguish taps from drags
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    // 10px threshold - anything more is a drag, not a tap
    if (dx > 10 || dy > 10) {
      hasDraggedRef.current = true;
    }
  }, []);

  const handleProductClick = useCallback(
    (handle: string) => {
      if (!hasDraggedRef.current) {
        router.push(`/products/${handle}`);
      }
    },
    [router]
  );

  const handleBrandClick = useCallback(
    (slug: string) => {
      if (!hasDraggedRef.current) {
        router.push(getBrandUrl(slug));
      }
    },
    [router]
  );

  if (!products?.length) return null;

  return (
    <div className="ml-2 my-8 md:my-12 xl:my-16 pr-2 w-full">
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
                onClick={() => handleProductClick(product.handle)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleProductClick(product.handle);
                  }
                }}
                role="link"
                tabIndex={0}
                className="cursor-pointer"
              >
                <ProductCard
                  product={product}
                  className="flex-shrink-0 w-[70vw] xl:w-[30vw] aspect-[4/5]"
                  sizes="(min-width: 1280px) 25vw, 70vw"
                  onBrandClick={handleBrandClick}
                  disableGallery
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default RelatedProducts;
