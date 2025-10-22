"use client";

import { type FeaturedProductsModule } from "../../../sanity.types";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HomeProductGrid from "./HomeProductGrid";
import { type SanityProduct } from "@/types/sanityProduct";

// Helper function to get the selected image based on imageSelection
function getSelectedImage(product: SanityProduct, imageSelection: string) {
  if (imageSelection === "main") {
    return {
      url: product.mainImage?.url || "",
      alt: product.mainImage?.alt || "Product",
    };
  }

  // TODO: Handle gallery images (gallery_0, gallery_1, etc.) - will be implemented later
  // if (imageSelection.startsWith("gallery_")) {
  //   const index = parseInt(imageSelection.split("_")[1]);
  //   const galleryImage = product.gallery?.[index];
  //   if (galleryImage?.asset?.url) {
  //     return {
  //       url: galleryImage.asset.url,
  //       alt: galleryImage.alt || "Product",
  //     };
  //   }
  // }

  // Fallback to main image
  return {
    url: product.mainImage?.url || "",
    alt: product.mainImage?.alt || "Product",
  };
}

function FeaturedProductsModule({
  featuredProductsModule,
  products,
}: {
  featuredProductsModule: FeaturedProductsModule;
  products: SanityProduct[];
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  // Create a map of products with their selected images
  const productsWithImages = products.map((product) => {
    const productItem = featuredProductsModule.featuredProducts?.find(
      (item) => item.product?._ref === product._id
    );

    return {
      product,
      imageSelection: productItem?.imageSelection || "main",
    };
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = false;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - startXRef.current);
    const deltaY = Math.abs(e.touches[0].clientY - startYRef.current);

    // If moved more than 5px, consider it a drag/scroll
    if (deltaX > 5 || deltaY > 5) {
      isDraggingRef.current = true;
    }
  };

  const handleProductClick = (handle: string) => {
    // Only navigate if user didn't drag/scroll
    if (!isDraggingRef.current) {
      router.push(`/products/${handle}`);
    }
  };

  const handleBrandClick = (e: React.MouseEvent, brandId?: string) => {
    e.stopPropagation();
    if (!isDraggingRef.current && brandId) {
      router.push(`/brands/${brandId}`);
    }
  };

  return (
    <div className="ml-2 pr-4 w-full">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-black text-lg font-medium">
          {featuredProductsModule.featuredHeading}
        </h2>
        <button
          className="text-black text-sm hover:underline cursor-pointer"
          onClick={() => {
            router.push(
              featuredProductsModule.featuredButtonLink || "/products"
            );
          }}
        >
          {featuredProductsModule.featuredButtonText || "View All"}
        </button>
      </div>

      {featuredProductsModule.displayType === "grid" ? (
        <HomeProductGrid
          products={products}
          count={featuredProductsModule.productCount}
        />
      ) : (
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-visible scrollbar-hide -mx-2 px-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          <div className="flex gap-2">
            {productsWithImages.map(({ product, imageSelection }) => {
              const selectedImage = getSelectedImage(product, imageSelection);
              return (
                <div
                  key={product._id}
                  className="flex-shrink-0 w-[70vw] aspect-[3/4] flex flex-col cursor-pointer"
                  onClick={() => handleProductClick(product.handle)}
                >
                  <div className="w-full h-full relative bg-gray-100">
                    {selectedImage.url && (
                      <Image
                        src={selectedImage.url}
                        alt={selectedImage.alt || "Product"}
                        className="w-full h-full object-cover"
                        fill
                        sizes="(max-width: 768px) 70vw, 33vw"
                        draggable={false}
                      />
                    )}
                  </div>
                  <div className="mt-2 mb-10">
                    <p
                      className="text-base font-medium hover:underline cursor-pointer"
                      onClick={(e) => handleBrandClick(e, product.brand?._id)}
                    >
                      {product.brand?.name}
                    </p>
                    <p className="text-base hover:underline cursor-pointer">
                      {product.title}
                    </p>
                    <p className="text-base mt-2">
                      {product.priceRange.minVariantPrice} SEK
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default FeaturedProductsModule;
