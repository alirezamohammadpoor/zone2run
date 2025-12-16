import React from "react";
import ProductGallerySkeleton from "./ProductGallerySkeleton";
import { SkeletonText, BaseSkeleton } from "./index";

export default function ProductDetailsSkeleton() {
  return (
    <div className="xl:flex xl:flex-row">
      {/* Gallery */}
      <ProductGallerySkeleton />

      {/* Product Info */}
      <div className="w-full px-2 xl:w-1/2 xl:flex xl:flex-col xl:justify-center xl:items-center">
        <div className="w-full xl:max-w-md">
          {/* Breadcrumbs skeleton */}
          <div className="mt-4 xl:mt-2">
            <SkeletonText width="3/4" size="sm" />
          </div>

          {/* Brand and title row */}
          <div className="flex justify-between items-center mt-2 xl:block">
            <SkeletonText width="1/4" size="sm" />
          </div>

          {/* Title and price row */}
          <div className="flex justify-between items-center xl:block">
            <SkeletonText width="3/4" size="sm" className="xl:w-full" />
            <SkeletonText width="1/4" size="sm" className="xl:mt-1" />
          </div>

          {/* Description skeleton */}
          <div className="mt-4 xl:w-[90%]">
            <SkeletonText width="full" size="sm" className="mb-1" />
            <SkeletonText width="full" size="sm" className="mb-1" />
            <SkeletonText width="3/4" size="sm" />
          </div>

          {/* Variant selector skeleton */}
          <div className="mt-4">
            <SkeletonText width="1/3" size="sm" className="mb-2" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <BaseSkeleton key={index} className="h-8" />
              ))}
            </div>
          </div>

          {/* Add to cart button skeleton */}
          <div className="mt-2">
            <BaseSkeleton className="w-full h-[50px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
