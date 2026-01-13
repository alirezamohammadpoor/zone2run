"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState, useRef, memo } from "react";
import { getBlurProps } from "@/lib/utils/imageProps";

interface ProductCardGalleryProps {
  images: Array<{ url: string; alt?: string; lqip?: string }>;
  sizes?: string;
  priority?: boolean;
  onNavigate?: () => void;
  disableGallery?: boolean;
}

const ProductCardGallery = memo(function ProductCardGallery({
  images,
  sizes,
  priority = false,
  onNavigate,
  disableGallery = false,
}: ProductCardGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Track pointer position to detect actual dragging vs. taps
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || disableGallery) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect, disableGallery]);

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

  const handleClick = useCallback((e: React.MouseEvent) => {
    // If user dragged more than threshold, don't navigate
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onNavigate?.();
  }, [onNavigate]);

  // Static image when gallery is disabled or single image
  if (disableGallery || images.length <= 1) {
    const mainImage = images[0];
    const hoverImage = images[1];

    return (
      <div
        className="w-full h-full relative group"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {mainImage?.url && (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || "Product"}
            fill
            sizes={sizes}
            className={`object-cover ${hoverImage?.url ? "transition-opacity duration-300 group-hover:opacity-0" : ""}`}
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
            alt={hoverImage.alt || "Product"}
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            draggable={false}
          />
        )}
      </div>
    );
  }

  const progressPercentage = ((selectedIndex + 1) / images.length) * 100;

  return (
    <div
      className="w-full h-full relative"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative flex-[0_0_100%] h-full"
            >
              <Image
                src={image.url}
                alt={image.alt || "Product"}
                fill
                sizes={sizes}
                className="object-cover"
                priority={priority && index === 0}
                loading={priority && index === 0 ? "eager" : "lazy"}
                fetchPriority={priority && index === 0 ? "high" : "auto"}
                draggable={false}
                {...getBlurProps(image)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-300">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
});

export default ProductCardGallery;
