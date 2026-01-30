"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState, memo } from "react";
import { getBlurProps } from "@/lib/utils/imageProps";

interface MobileCarouselProps {
  images: Array<{ url: string; alt?: string; lqip?: string }>;
  sizes?: string;
  priority?: boolean;
}

const MobileCarousel = memo(function MobileCarousel({
  images,
  sizes,
  priority = false,
}: MobileCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const progressPercentage = ((selectedIndex + 1) / images.length) * 100;

  return (
    <>
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

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-300">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </>
  );
});

export default MobileCarousel;
