"use client";

import { memo, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import ProductCard from "./ProductCard";

/**
 * Minimal product shape for carousel.
 * Accepts both full SanityProduct and minimal HomepageProduct.
 */
interface CarouselProduct {
  _id: string;
  handle: string;
  title: string;
  vendor: string;
  priceRange: { minVariantPrice: number };
  selectedImage?: { url: string; alt: string };
  gallery?: Array<{ url: string; alt?: string }>;
  mainImage?: { url: string; alt: string };
  brand?: { name?: string; slug?: string };
  brandName?: string | null;
  brandSlug?: string | null;
}

interface ProductCarouselProps {
  products: Array<CarouselProduct>;
  className?: string;
  cardClassName?: string;
  sizes?: string;
  /** Callback when a product is clicked (fires only on tap, not drag) */
  onProductClick?: () => void;
}

const ProductCarousel = memo(function ProductCarousel({
  products,
  className,
  cardClassName = "flex-shrink-0 w-[70vw] min-w-0 xl:w-[30vw]",
  sizes = "(max-width: 768px) 70vw, 33vw",
  onProductClick,
}: ProductCarouselProps) {
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

  const handleProductClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
      } else {
        onProductClick?.();
      }
    },
    [isDragging, onProductClick],
  );

  if (!products?.length) {
    return null;
  }

  return (
    <div className={className ?? "overflow-hidden -mx-2 px-2"} ref={emblaRef}>
      <div className="flex gap-2">
        {products.map((product) => (
          <Link
            key={product._id || product.handle}
            href={`/products/${product.handle}`}
            onClick={handleProductClick}
            className={`cursor-pointer ${isDragging ? "pointer-events-none" : ""}`}
          >
            <ProductCard
              product={product}
              className={cardClassName}
              sizes={sizes}
              disableGallery
            />
          </Link>
        ))}
      </div>
    </div>
  );
});

export default ProductCarousel;
