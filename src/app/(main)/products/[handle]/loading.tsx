import React from "react";
import ProductDetailsSkeleton from "@/components/skeletons/ProductDetailsSkeleton";
import ProductTabsSkeleton from "@/components/skeletons/ProductTabsSkeleton";
import RelatedProductsSkeleton from "@/components/skeletons/RelatedProductsSkeleton";

export default function ProductPageLoading() {
  return (
    <>
      <div>
        <ProductDetailsSkeleton />
        <ProductTabsSkeleton />
        <RelatedProductsSkeleton />
      </div>
    </>
  );
}

