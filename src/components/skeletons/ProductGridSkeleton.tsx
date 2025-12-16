import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductGridSkeletonProps {
  count?: number;
}

export default function ProductGridSkeleton({
  count = 6,
}: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 mx-2">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

