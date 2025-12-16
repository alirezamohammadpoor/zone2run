import React from "react";
import { SkeletonImage, BaseSkeleton } from "./index";

export default function ProductGallerySkeleton() {
  return (
    <div className="relative w-full xl:w-[72vw]">
      {/* Mobile: single image */}
      <div className="xl:hidden">
        <SkeletonImage aspectRatio="4/5" />
      </div>

      {/* XL: carousel with multiple visible images */}
      <div className="hidden xl:flex gap-2 overflow-hidden">
        <div className="flex-[0_0_36vw] h-[92vh]">
          <BaseSkeleton className="w-full h-full" />
        </div>
        <div className="flex-[0_0_36vw] h-[92vh]">
          <BaseSkeleton className="w-full h-full" />
        </div>
      </div>

      {/* Image counter skeleton */}
      <div className="absolute bottom-4 right-0 px-3 py-1">
        <BaseSkeleton className="w-12 h-4" />
      </div>

      {/* Progress bar skeleton */}
      <div className="flex w-full h-[2px] bg-gray-300">
        <BaseSkeleton className="h-full w-1/5" />
      </div>
    </div>
  );
}
