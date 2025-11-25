import React from "react";
import { BaseSkeleton, SkeletonText } from "./index";

export default function CartSkeleton() {
  return (
    <div className="flex w-full overflow-hidden mt-8 px-4">
      <div className="w-full space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <BaseSkeleton className="w-20 h-20 flex-shrink-0" />
            <div className="flex-1">
              <SkeletonText width="3/4" size="base" className="mb-2" />
              <SkeletonText width="1/2" size="sm" className="mb-2" />
              <SkeletonText width="1/4" size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
