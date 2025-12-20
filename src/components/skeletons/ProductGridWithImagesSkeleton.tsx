import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";
import EditorialImageSkeleton from "./EditorialImageSkeleton";

interface ProductGridWithImagesSkeletonProps {
  productsPerImage?: number;
  productsPerImageXL?: number;
  productCount?: number;
  imageCount?: number;
  gridLayout?: "4col" | "3col";
}

export default function ProductGridWithImagesSkeleton({
  productsPerImage = 4,
  productsPerImageXL = 8,
  productCount = 12,
  imageCount = 2,
  gridLayout = "4col",
}: ProductGridWithImagesSkeletonProps) {
  // Determine XL grid columns based on layout
  const xlGridCols =
    gridLayout === "3col" ? "xl:grid-cols-3" : "xl:grid-cols-4";

  // Create array of items for mobile (products and images)
  const mobileItems: Array<{ type: "product" | "image" }> = [];
  for (let i = 0; i < productCount; i++) {
    mobileItems.push({ type: "product" });
    if ((i + 1) % productsPerImage === 0 && i < productCount - 1) {
      const imageIndex = Math.floor((i + 1) / productsPerImage);
      if (imageIndex < imageCount) {
        mobileItems.push({ type: "image" });
      }
    }
  }

  // Create array of items for XL (different spacing)
  const xlItems: Array<{ type: "product" | "image" }> = [];
  for (let i = 0; i < productCount; i++) {
    xlItems.push({ type: "product" });
    if ((i + 1) % productsPerImageXL === 0 && i < productCount - 1) {
      const imageIndex = Math.floor((i + 1) / productsPerImageXL);
      if (imageIndex < imageCount) {
        xlItems.push({ type: "image" });
      }
    }
  }

  return (
    <>
      {/* Mobile grid */}
      <div className="grid grid-cols-2 gap-2 px-2 xl:hidden">
        {mobileItems.map((item, idx) => {
          if (item.type === "product") {
            return <ProductCardSkeleton key={`mobile-product-${idx}`} />;
          }
          if (item.type === "image") {
            return (
              <div key={`mobile-image-${idx}`} className="col-span-2">
                <EditorialImageSkeleton />
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* XL grid */}
      <div className={`hidden xl:grid ${xlGridCols} gap-2 px-2`}>
        {xlItems.map((item, idx) => {
          if (item.type === "product") {
            return <ProductCardSkeleton key={`xl-product-${idx}`} />;
          }
          if (item.type === "image") {
            return (
              <div
                key={`xl-image-${idx}`}
                className={
                  gridLayout === "3col"
                    ? "w-full aspect-[4/5]"
                    : "col-span-2 row-span-2 w-full h-[94.1%]"
                }
              >
                <EditorialImageSkeleton />
              </div>
            );
          }
          return null;
        })}
      </div>
    </>
  );
}

