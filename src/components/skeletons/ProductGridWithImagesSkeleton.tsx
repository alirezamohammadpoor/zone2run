import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";
import EditorialImageSkeleton from "./EditorialImageSkeleton";

interface ProductGridWithImagesSkeletonProps {
  productsPerImage?: number;
  productCount?: number;
  imageCount?: number;
}

export default function ProductGridWithImagesSkeleton({
  productsPerImage = 6,
  productCount = 12,
  imageCount = 2,
}: ProductGridWithImagesSkeletonProps) {
  // Create array of items (products and images)
  const items: Array<{ type: "product" | "image" }> = [];
  
  // Add first image at the top
  const hasFirstImage = imageCount > 0;
  
  // Add products and interspersed images
  for (let i = 0; i < productCount; i++) {
    items.push({ type: "product" });
    
    // After every N products, add an image (skip first image)
    if ((i + 1) % productsPerImage === 0 && i < productCount - 1) {
      const imageIndex = Math.floor((i + 1) / productsPerImage);
      if (imageIndex < imageCount) {
        items.push({ type: "image" });
      }
    }
  }

  return (
    <>
      {/* First editorial image */}
      {hasFirstImage && (
        <div className="mx-2 mb-4">
          <EditorialImageSkeleton />
        </div>
      )}

      {/* Grid with products and interspersed images */}
      <div className="grid grid-cols-2 gap-2 mx-2">
        {items.map((item, idx) => {
          if (item.type === "product") {
            return <ProductCardSkeleton key={`product-${idx}`} />;
          }
          if (item.type === "image") {
            return (
              <div key={`image-${idx}`} className="col-span-2">
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

