import React from "react";
import { SkeletonText, BaseSkeleton } from "./index";

export default function ProductTabsSkeleton() {
  return (
    <div className="my-8 md:my-12 xl:my-16">
      {/* Tab Navigation Skeleton */}
      <div className="flex border-b">
        {Array.from({ length: 4 }).map((_, index) => (
          <BaseSkeleton key={index} className="flex-1 h-10 mx-2" />
        ))}
      </div>

      {/* Tab Content Skeleton */}
      <div className="ml-2 mt-4 space-y-2">
        <SkeletonText width="full" size="base" />
        <SkeletonText width="full" size="base" />
        <SkeletonText width="full" size="base" />
        <SkeletonText width="full" size="base" />
      </div>
    </div>
  );
}
