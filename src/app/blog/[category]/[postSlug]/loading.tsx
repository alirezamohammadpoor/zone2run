import React from "react";
import { BaseSkeleton, SkeletonText } from "@/components/skeletons";

export default function BlogPostLoading() {
  return (
    <div className="w-full">
      {/* Hero skeleton */}
      <BaseSkeleton className="w-full h-[70vh] mb-2 xl:mb-4" />

      {/* Title & Meta skeleton */}
      <div className="w-full px-2 py-2 xl:max-w-4xl xl:mx-auto xl:px-4 xl:py-4">
        <SkeletonText width="3/4" size="base" className="mb-6" />
        <div className="flex items-center gap-4 mb-6">
          <SkeletonText width="1/4" size="sm" />
          <SkeletonText width="1/4" size="sm" />
          <SkeletonText width="1/4" size="sm" />
        </div>
        <SkeletonText width="full" size="sm" />
      </div>

      {/* Content skeleton */}
      <div className="w-full px-2 py-2 xl:max-w-4xl xl:mx-auto xl:px-4">
        {/* Paragraphs */}
        <div className="mb-6">
          <SkeletonText width="full" size="sm" className="mb-2" />
          <SkeletonText width="full" size="sm" className="mb-2" />
          <SkeletonText width="3/4" size="sm" />
        </div>

        <div className="mb-6">
          <SkeletonText width="full" size="sm" className="mb-2" />
          <SkeletonText width="full" size="sm" className="mb-2" />
          <SkeletonText width="1/2" size="sm" />
        </div>

        {/* Inline image skeleton */}
        <BaseSkeleton className="w-full h-[50vh] xl:h-[70vh] mb-4" />

        <div className="mb-6">
          <SkeletonText width="full" size="sm" className="mb-2" />
          <SkeletonText width="full" size="sm" className="mb-2" />
          <SkeletonText width="3/4" size="sm" />
        </div>
      </div>
    </div>
  );
}
