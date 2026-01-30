"use client";

import Image from "next/image";
import { useRef, useState, useEffect, memo } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which slide is visible via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || images.length <= 1) return;

    const slides = container.children;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Array.prototype.indexOf.call(slides, entry.target);
            if (index >= 0) setActiveIndex(index);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    for (const slide of slides) {
      observer.observe(slide);
    }

    return () => observer.disconnect();
  }, [images.length]);

  const progressPercentage = ((activeIndex + 1) / images.length) * 100;

  return (
    <>
      <div
        ref={scrollRef}
        className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="relative flex-[0_0_100%] h-full snap-start"
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

      {/* Progress bar */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-300">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </>
  );
});

export default MobileCarousel;
