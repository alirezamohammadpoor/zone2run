import React from "react";
import { SkeletonText, BaseSkeleton } from "./index";

export default function ProductTabsSkeleton() {
  return (
    <div className="mt-12 mb-12">
      {/* Tab Navigation Skeleton */}
      <div className="flex border-b">
        {Array.from({ length: 4 }).map((_, index) => (
          <BaseSkeleton key={index} className="flex-1 h-10 mx-2" />
        ))}
      </div>

      {/* Tab Content Skeleton */}
      <div className="ml-2 mt-4">
        <SkeletonText width="full" height="base" lines={4} />
      </div>
    </div>
  );
}
