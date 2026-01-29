"use client";

import React from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

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
  if (!editorialImages || editorialImages.length === 0) {
    return null;
  }

  return (
    <div className="ml-2 my-8 md:my-12 xl:my-16 pr-2 w-full">
      <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
        <div className="flex gap-2">
          {editorialImages.map((item) => {
            const imageUrl = item.image?.asset?.url;
            if (!imageUrl) return null;

            return (
              <div
                key={item._key}
                className="flex-shrink-0 w-[70vw] xl:w-[30vw] aspect-[4/5] relative snap-start"
              >
                <Image
                  src={urlFor(item.image).url()}
                  alt={item.image.alt || item.caption || "Editorial image"}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 30vw, 70vw"
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
