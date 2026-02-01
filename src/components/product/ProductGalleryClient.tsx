"use client";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { getBlurProps } from "@/lib/utils/imageProps";

interface ProductGalleryClientProps {
  images: Array<{ url: string; alt: string; lqip?: string }>;
}

export default function ProductGalleryClient({
  images,
}: ProductGalleryClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (images.length === 0) {
    return null;
  }

  const totalImages = images.length;
  const progressPercentage = ((selectedIndex + 1) / totalImages) * 100;

  return (
    <div
      className="relative aspect-[4/5] xl:w-full xl:h-[92.5vh]"
      role="group"
      aria-label="Product image gallery"
    >
      {/* Embla carousel container */}
      <div className="overflow-hidden h-full" ref={emblaRef} aria-hidden="true">
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative flex-[0_0_100%] h-full"
            >
              <Image
                src={image.url}
                alt={image.alt || "Product image"}
                fill
                className="object-cover"
                priority={index === 0}
                loading="eager"
                fetchPriority={index === 0 ? "high" : "auto"}
                sizes="(min-width: 1280px) 50vw, (min-width: 768px) 60vw, 100vw"
                draggable={false}
                {...getBlurProps(image)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Previous image"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 5 8"
              className="w-4 h-4 text-black rotate-180"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Next image"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 5 8"
              className="w-4 h-4 text-black"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </>
      )}

      {/* Live region for screen reader announcements */}
      {images.length > 1 && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="absolute bottom-4 right-0 px-3 py-1 text-xs text-black"
        >
          <span aria-hidden="true">
            {selectedIndex + 1} / {images.length}
          </span>
          <span className="sr-only">
            Image {selectedIndex + 1} of {images.length}
            {images[selectedIndex]?.alt ? `: ${images[selectedIndex].alt}` : ""}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 flex w-full h-[2px] bg-gray-300">
          <div
            className="h-full bg-black transition-all duration-150"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
