import React from "react";
import { SkeletonImage, SkeletonText } from "./index";

export default function BlogProductCardSkeleton() {
  return (
    <div className="w-full aspect-[3/4] flex flex-col">
      <SkeletonImage aspectRatio="3/4" />
      <div className="mt-2 mb-10">
        <SkeletonText width="1/3" size="sm" className="mb-1" />
        <SkeletonText width="full" size="sm" className="mb-2" />
        <SkeletonText width="1/4" size="sm" className="mt-2" />
      </div>
    </div>
  );
}
