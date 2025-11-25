import React from "react";
import { SkeletonImage, BaseSkeleton } from "./index";

export default function ProductGallerySkeleton() {
  return (
    <div className="relative w-full">
      <SkeletonImage aspectRatio="4/5" />

      {/* Image counter skeleton */}
      <div className="absolute bottom-4 right-0 px-3 py-1">
        <BaseSkeleton className="w-12 h-4" />
      </div>

      {/* Progress bar skeleton */}
      <div className="flex w-full h-[1.5px] bg-gray-300 mt-2">
        <BaseSkeleton className="h-full w-1/5" />
      </div>
    </div>
  );
}
