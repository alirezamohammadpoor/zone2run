import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface RelatedProductsSkeletonProps {
  count?: number;
}

export default function RelatedProductsSkeleton({
  count = 3,
}: RelatedProductsSkeletonProps) {
  return (
    <div className="mx-2 my-4">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-[70vw] min-w-0 xl:w-[30vw]">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

