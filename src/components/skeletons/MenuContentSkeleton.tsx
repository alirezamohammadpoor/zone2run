import React from "react";
import { SkeletonText, BaseSkeleton } from "./index";

export default function MenuContentSkeleton() {
  return (
    <div className="p-2">
      <div className="mb-6">
        <SkeletonText width="1/3" size="base" className="mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonText key={index} width="1/2" size="sm" />
          ))}
        </div>
      </div>
      <div className="mb-6">
        <SkeletonText width="1/3" size="base" className="mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonText key={index} width="1/2" size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
