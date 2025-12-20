import React from "react";
import { BaseSkeleton, SkeletonText } from "./index";

export default function BlogPostCardSkeleton() {
  return (
    <div className="mb-6">
      {/* Image skeleton */}
      <BaseSkeleton className="w-full h-[50vh] xl:h-[60vh] mb-4" />

      {/* Text content */}
      <div className="space-y-2">
        {/* Title */}
        <SkeletonText width="3/4" size="base" />

        {/* Excerpt */}
        <SkeletonText width="full" size="sm" />

        {/* Meta row */}
        <div className="flex items-center justify-between mt-2">
          <SkeletonText width="1/4" size="sm" />
          <SkeletonText width="1/4" size="sm" />
        </div>
      </div>
    </div>
  );
}
