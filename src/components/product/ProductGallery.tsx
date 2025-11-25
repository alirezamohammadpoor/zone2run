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
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative aspect-[4/5] min-w-full flex-shrink-0"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 right-0 px-3 py-1 text-sm text-black">
          {selectedIndex + 1} / {images.length}
        </div>
      )}

      {/* Progress bar - percentage based */}
      {images.length > 1 && (
        <div className="flex w-full h-[1.5px] bg-gray-300">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
