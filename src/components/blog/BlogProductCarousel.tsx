"use client";

import React, { memo, useCallback, useMemo, useRef } from "react";
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

const BlogProductCarousel = memo(function BlogProductCarousel({
  products,
}: BlogProductCarouselProps) {
  const router = useRouter();
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  // Track pointer position to detect actual dragging vs. taps
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);

  const validProducts = useMemo(
    () => products.filter((item) => item?.product),
    [products]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 10 || dy > 10) {
      hasDraggedRef.current = true;
    }
  }, []);

  const handleProductClick = useCallback((handle: string) => {
    if (!hasDraggedRef.current) {
      router.push(`/products/${handle}`);
    }
  }, [router]);

  const handleBrandClick = useCallback((slug: string) => {
    if (!hasDraggedRef.current) {
      router.push(getBrandUrl(slug));
    }
  }, [router]);

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
            <div
              key={p._id || idx}
              onClick={() => handleProductClick(p.handle)}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleProductClick(p.handle);
                }
              }}
              role="link"
              tabIndex={0}
              className="cursor-pointer"
            >
              <ProductCard
                product={{
                  ...p,
                  selectedImage,
                }}
                className="flex-shrink-0 w-[70vw] min-w-0 xl:w-[30vw]"
                sizes="(max-width: 768px) 70vw, 33vw"
                onBrandClick={handleBrandClick}
                disableGallery
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default BlogProductCarousel;
