"use client";
import React from "react";
import LocaleLink from "@/components/LocaleLink";
import Image from "next/image";
import type { SanityProduct } from "@/types/sanityProduct";

interface ColorVariantsProps {
  colorVariants?: Array<{
    _id: string;
    title: string;
    handle: string;
    mainImage: {
      url: string;
      alt: string;
    };
  }>;
  currentProductId: string;
}

export default function ColorVariants({
  colorVariants,
  currentProductId,
}: ColorVariantsProps) {
  if (!colorVariants || colorVariants.length === 0) {
    return null;
  }

  // Filter out current product
  const otherVariants = colorVariants.filter(
    (variant) => variant._id !== currentProductId
  );

  if (otherVariants.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-2 max-w-md mx-auto my-8 md:my-12 xl:my-16">
      <h3 className="mb-2 text-sm font-medium">Available Colors</h3>
      <div className="flex gap-2 flex-wrap">
        {otherVariants.map((variant) => (
          <LocaleLink
            key={variant._id}
            href={`/products/${variant.handle}`}
            className="relative w-16 h-16 border border-gray-300 hover:border-black transition-colors"
          >
            <Image
              src={variant.mainImage.url}
              alt={variant.mainImage.alt || variant.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </LocaleLink>
        ))}
      </div>
    </div>
  );
}

