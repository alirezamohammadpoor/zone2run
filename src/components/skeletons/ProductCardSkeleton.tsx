import React from "react";
import { SkeletonImage, SkeletonText } from "./index";

export default function ProductCardSkeleton() {
  return (
    <div className="w-full aspect-[3/4] flex flex-col">
      <SkeletonImage aspectRatio="3/4" />
      <div className="mt-2 mb-4">
        <SkeletonText width="1/3" size="base" className="mb-1" />
        <div className="space-y-1 h-[3rem]">
          <SkeletonText width="full" size="base" />
          <SkeletonText width="full" size="base" />
        </div>
      </div>
      <div>
        <SkeletonText width="1/4" size="base" className="mb-4" />
      </div>
    </div>
  );
}
