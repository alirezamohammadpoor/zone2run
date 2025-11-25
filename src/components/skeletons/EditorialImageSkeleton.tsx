import React from "react";
import { BaseSkeleton } from "./index";

interface EditorialImageSkeletonProps {
  showCaption?: boolean;
}

export default function EditorialImageSkeleton({
  showCaption = false,
}: EditorialImageSkeletonProps) {
  return (
    <div className="w-full h-[50vh] relative bg-gray-100 my-2">
      <BaseSkeleton className="w-full h-full" />
      {showCaption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
          <BaseSkeleton className="h-4 w-1/2" />
        </div>
      )}
    </div>
  );
}
