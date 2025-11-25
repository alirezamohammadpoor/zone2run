import React from "react";
import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton";
import { BaseSkeleton } from "@/components/skeletons";

export default function HomePageLoading() {
  return (
    <div>
      {/* Hero section skeleton */}
      <div className="w-full h-[60vh] mb-8">
        <BaseSkeleton className="w-full h-full" />
      </div>

      {/* Featured products skeleton */}
      <div className="mb-12">
        <BaseSkeleton className="h-8 w-48 mx-2 mb-4" />
        <ProductGridSkeleton count={4} />
      </div>

      {/* Editorial module skeleton */}
      <div className="w-full h-[50vh] mb-8">
        <BaseSkeleton className="w-full h-full" />
      </div>
    </div>
  );
}
