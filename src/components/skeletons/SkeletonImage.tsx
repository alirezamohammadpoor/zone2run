import React from "react";
import { BaseSkeleton } from "./BaseSkeleton";

interface SkeletonImageProps {
  aspectRatio?: "3/4" | "4/5" | "1/1" | "16/9";
  className?: string;
}

const aspectClasses = {
  "3/4": "aspect-[3/4]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
};

export function SkeletonImage({
  aspectRatio = "3/4",
  className = "",
}: SkeletonImageProps) {
  return (
    <BaseSkeleton
      className={`w-full ${aspectClasses[aspectRatio]} ${className}`}
    />
  );
}
