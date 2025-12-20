import React from "react";
import ProductGridSkeleton from "./ProductGridSkeleton";

export default function SearchResultsSkeleton() {
  return (
    <div className="px-2">
      <ProductGridSkeleton count={6} />
    </div>
  );
}

