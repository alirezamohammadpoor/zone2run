import React from "react";
import ProductGridWithImagesSkeleton from "@/components/skeletons/ProductGridWithImagesSkeleton";

export default function BrandPageLoading() {
  return (
    <div>
      <div className="mb-6 px-2">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
      </div>
      <ProductGridWithImagesSkeleton />
    </div>
  );
}

