"use client";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ProductGalleryProps {
  mainImage: { url: string; alt: string } | null;
  galleryImages?: Array<{ url: string; alt?: string }> | null;
  title?: string;
}

export default function ProductGallery({
  mainImage,
  galleryImages,
  title,
}: ProductGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const images = useMemo(() => {
    const normalizedImages: Array<{ url: string; alt: string }> = [];

    // Add main image first
    if (mainImage?.url) {
      normalizedImages.push({
        url: mainImage.url,
        alt: mainImage.alt || title || "Product",
      });
    }

    // Add gallery images
    if (galleryImages) {
      galleryImages.forEach((img) => {
        if (img?.url) {
          normalizedImages.push({
            url: img.url,
            alt: img.alt || title || "Product",
          });
        }
      });
    }

    return normalizedImages;
  }, [mainImage, galleryImages, title]);

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
    return (
      <div className="w-full relative aspect-[4/5] flex items-center justify-center bg-gray-100">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  // Calculate progress percentage
  const totalImages = images.length;
  const currentImageNumber = selectedIndex + 1;
  const progressPercentage =
    totalImages > 0 ? (currentImageNumber / totalImages) * 100 : 0;

  return (
    <div
      className="relative w-full xl:w-[45vw] overflow-hidden 2xl:w-[45vw]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative aspect-[4/5] flex-[0_0_100%] xl:flex-[0_0_45vw] xl:h-[92vh]"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                sizes="(min-width: 1280px) 50vw, 100vw"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - show on hover when multiple images */}
      {images.length > 1 && (
        <>
          {/* Previous Arrow */}
          <button
            onClick={scrollPrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 transition-opacity duration-300 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
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

          {/* Next Arrow */}
          <button
            onClick={scrollNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 transition-opacity duration-300 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
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

      {images.length > 1 && (
        <div className="absolute bottom-4 right-0 px-3 py-1 text-xs text-black">
          {selectedIndex + 1} / {images.length}
        </div>
      )}

      {/* Progress bar - percentage based */}
      {images.length > 1 && (
        <div className="flex w-full h-[2px] bg-gray-300">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
