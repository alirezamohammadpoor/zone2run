import React from "react";
import { SkeletonImage, SkeletonText } from "./index";

export default function ProductCardSkeleton() {
  return (
    <div className="w-full aspect-[4/5] flex flex-col">
      <SkeletonImage aspectRatio="4/5" />
      <div className="pt-2 pb-4">
        <SkeletonText width="1/3" size="sm" className="mb-1" />
        <SkeletonText width="full" size="sm" className="mb-2" />
        <SkeletonText width="1/4" size="sm" className="mt-2" />
      </div>
    </div>
  );
}
