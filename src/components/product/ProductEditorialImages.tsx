"use client";

import React from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import useEmblaCarousel from "embla-carousel-react";

export type EditorialImage = {
  _key: string;
  image: {
    asset: {
      _id: string;
      url: string;
    };
    alt?: string;
  };
  caption?: string;
};

interface ProductEditorialImagesProps {
  editorialImages?: EditorialImage[];
}

export default function ProductEditorialImages({
  editorialImages,
}: ProductEditorialImagesProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  if (!editorialImages || editorialImages.length === 0) {
    return null;
  }

  return (
    <div className="ml-2 mt-10 mb-12 pr-4 w-full">
      <div className="overflow-hidden -mx-2 px-2" ref={emblaRef}>
        <div className="flex gap-2">
          {editorialImages.map((item) => {
            const imageUrl = item.image?.asset?.url;
            if (!imageUrl) return null;

            return (
              <div
                key={item._key}
                className="flex-shrink-0 w-[70vw] min-w-0 aspect-[3/4] relative bg-gray-100"
              >
                <Image
                  src={urlFor(item.image).url()}
                  alt={item.image.alt || item.caption || "Editorial image"}
                  fill
                  className="object-cover"
                  sizes="70vw"
                  draggable={false}
                />
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                    {item.caption}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
