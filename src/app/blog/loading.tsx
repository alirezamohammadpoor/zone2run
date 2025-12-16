import React from "react";
import BlogPostCardSkeleton from "@/components/skeletons/BlogPostCardSkeleton";
import { SkeletonText } from "@/components/skeletons";

export default function BlogLoading() {
  return (
    <div className="w-full mt-8 mb-8 px-2 xl:px-8">
      {/* Header skeleton */}
      <div className="mb-16 mt-2 xl:max-w-2xl">
        <SkeletonText width="1/4" size="base" className="mb-2" />
        <SkeletonText width="full" size="sm" />
        <SkeletonText width="3/4" size="sm" className="mt-1" />
      </div>

      {/* Blog posts grid */}
      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-2 xl:gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <BlogPostCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
