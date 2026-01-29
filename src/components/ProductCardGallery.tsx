"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState, memo } from "react";
import { getBlurProps } from "@/lib/utils/imageProps";

const ArrowIcon = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 5 8"
    className={`w-3 h-3 text-black ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
      fill="currentColor"
    />
  </svg>
);

interface ProductCardGalleryProps {
  images: Array<{ url: string; alt?: string; lqip?: string }>;
  sizes?: string;
  priority?: boolean;
  disableGallery?: boolean;
}

const ProductCardGallery = memo(function ProductCardGallery({
  images,
  sizes,
  priority = false,
  disableGallery = false,
}: ProductCardGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Static image when gallery is disabled or single image
  if (disableGallery || images.length <= 1) {
    const mainImage = images[0];
    const hoverImage = images[1];

    return (
      <div
        className="w-full h-full relative group"
        aria-hidden="true"
      >
        {mainImage?.url && (
          <Image
            src={mainImage.url}
            alt=""
            fill
            sizes={sizes}
            className={`object-cover ${hoverImage?.url ? "transition-opacity duration-300 xl:group-hover:opacity-0" : ""}`}
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
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-300 xl:group-hover:opacity-100"
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
      aria-hidden="true"
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
                alt=""
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

      {/* Navigation Arrows - hidden on mobile, visible on md+ */}
      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 p-3 min-w-[44px] min-h-[44px] items-center justify-center focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Previous image"
          >
            <ArrowIcon className="rotate-180" />
          </button>
          <button
            onClick={scrollNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 p-3 min-w-[44px] min-h-[44px] items-center justify-center focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Next image"
          >
            <ArrowIcon />
          </button>
        </>
      )}

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
