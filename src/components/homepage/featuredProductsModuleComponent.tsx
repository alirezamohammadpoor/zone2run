"use client";

import { type FeaturedProductsModule } from "../../../sanity.types";
import React from "react";
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
        <div className="gap-2 flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x scrollbar-hide">
          {productsWithImages.map(({ product, imageSelection }) => {
            const selectedImage = getSelectedImage(product, imageSelection);
            return (
              <div
                key={product._id}
                className="flex-shrink-0 w-[70vw] aspect-[3/4] flex flex-col hover:cursor-pointer snap-start"
                onClick={() => {
                  router.push(`/products/${product.handle}`);
                }}
              >
                <div
                  className="w-full h-full relative bg-gray-100 hover:cursor-pointer"
                  onClick={() => {
                    router.push(`/products/${product.handle}`);
                  }}
                >
                  {selectedImage.url && (
                    <Image
                      src={selectedImage.url}
                      alt={selectedImage.alt || "Product"}
                      className="w-full h-full object-cover"
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  )}
                </div>
                <div className="mt-2 mb-10">
                  <p
                    className="text-base font-medium hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.brand?._id) {
                        router.push(`/brands/${product.brand._id}`);
                      }
                    }}
                  >
                    {product.brand?.name}
                  </p>
                  <p
                    className="text-base hover:underline cursor-pointer"
                    onClick={() => {
                      router.push(`/products/${product.handle}`);
                    }}
                  >
                    {product.title}
                  </p>
                  <p className="text-base mt-2">
                    {product.priceRange.minVariantPrice} {"SEK"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FeaturedProductsModule;
