import React from "react";
import ProductGallerySkeleton from "./ProductGallerySkeleton";
import { SkeletonText, BaseSkeleton } from "./index";

export default function ProductDetailsSkeleton() {
  return (
    <div className="">
      <ProductGallerySkeleton />

      {/* Breadcrumbs skeleton */}
      <div className="mt-4 ml-2">
        <SkeletonText width="3/4" size="sm" />
      </div>

      {/* Brand and title row */}
      <div className="flex justify-between items-center mt-4">
        <SkeletonText width="1/4" size="base" className="ml-2" />
        <SkeletonText width="1/4" size="base" className="mr-2" />
      </div>

      {/* Title and price row */}
      <div className="flex justify-between items-center">
        <SkeletonText width="3/4" size="base" className="ml-2" />
        <SkeletonText width="1/4" size="base" className="mr-2" />
      </div>

      {/* Variant selector skeleton */}
      <div className="mx-2 mt-4">
        <SkeletonText width="1/3" size="sm" className="mb-2" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <BaseSkeleton key={index} className="h-8" />
          ))}
        </div>
      </div>

      {/* Add to cart button skeleton */}
      <div className="mx-2 mt-2">
        <BaseSkeleton className="w-full h-[50px]" />
      </div>
    </div>
  );
}
