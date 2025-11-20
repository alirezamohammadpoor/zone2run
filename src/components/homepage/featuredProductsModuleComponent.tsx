"use client";

import { type FeaturedProductsModule } from "../../../sanity.types";
import React, { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HomeProductGrid from "./HomeProductGrid";
import { type SanityProduct } from "@/types/sanityProduct";
import useEmblaCarousel from "embla-carousel-react";
import { getBrandUrl } from "@/lib/utils/brandUrls";

// Helper function to get the selected image based on imageSelection
function getSelectedImage(product: SanityProduct, imageSelection: string) {
  if (imageSelection === "main") {
    return {
      url: product.mainImage?.url || "",
      alt: product.mainImage?.alt || "Product",
    };
  }

  // Handle gallery images (gallery_0, gallery_1, etc.)
  if (imageSelection.startsWith("gallery_")) {
    const index = parseInt(imageSelection.split("_")[1]);
    const galleryLength = product.gallery?.length || 0;

    // Check if index is valid
    if (index >= galleryLength) {
      // Fall back to main image if index doesn't exist
      return {
        url: product.mainImage?.url || "",
        alt: product.mainImage?.alt || "Product",
      };
    }

    const galleryImage = product.gallery?.[index];

    // Check if gallery image exists and has URL
    if (galleryImage?.url) {
      return {
        url: galleryImage.url,
        alt: galleryImage.alt || "Product",
      };
    }
  }

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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });
  const isDraggingRef = useRef(false);

  // Create a map of products with their selected images
  const productsWithImages = products.map((product) => {
    const productItem = featuredProductsModule.featuredProducts?.find(
      (item) => item.product?._ref === product._id
    );

    const imageSelection = productItem?.imageSelection || "main";

    return {
      product,
      imageSelection,
    };
  });

  // Track dragging state from Embla
  React.useEffect(() => {
    if (!emblaApi) return;

    let isPointerDown = false;
    let hasMoved = false;

    const onPointerDown = () => {
      isPointerDown = true;
      hasMoved = false;
      isDraggingRef.current = false;
    };

    const onPointerMove = () => {
      if (isPointerDown) {
        hasMoved = true;
        isDraggingRef.current = true;
      }
    };

    const onPointerUp = () => {
      if (isPointerDown && hasMoved) {
        // User was dragging, prevent click
        isDraggingRef.current = true;
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 100);
      } else {
        // User just clicked, allow navigation
        isDraggingRef.current = false;
      }
      isPointerDown = false;
      hasMoved = false;
    };

    const onSettle = () => {
      // Reset after carousel settles
      isDraggingRef.current = false;
    };

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerMove", onPointerMove);
    emblaApi.on("pointerUp", onPointerUp);
    emblaApi.on("settle", onSettle);

    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerMove", onPointerMove);
      emblaApi.off("pointerUp", onPointerUp);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi]);

  const handleProductClick = useCallback(
    (handle: string) => {
      // Only navigate if user didn't drag/scroll
      if (!isDraggingRef.current) {
        router.push(`/products/${handle}`);
      }
    },
    [router]
  );

  const handleBrandClick = useCallback(
    (e: React.MouseEvent, brandSlug?: string) => {
      e.stopPropagation();
      if (!isDraggingRef.current && brandSlug) {
        router.push(getBrandUrl(brandSlug));
      }
    },
    [router]
  );

  return (
    <div className="ml-2 mt-4 pr-4 w-full">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-black text-xl">
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
          products={productsWithImages.map(({ product, imageSelection }) => ({
            ...product,
            selectedImage: getSelectedImage(product, imageSelection),
          }))}
          count={featuredProductsModule.productCount}
        />
      ) : (
        <div className="overflow-hidden -mx-2 px-2" ref={emblaRef}>
          <div className="flex gap-2">
            {productsWithImages.map(({ product, imageSelection }) => {
              const selectedImage = getSelectedImage(product, imageSelection);
              return (
                <div
                  key={product._id}
                  className="flex-shrink-0 w-[70vw] min-w-0 aspect-[3/4] flex flex-col cursor-pointer"
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
                      onClick={(e) => handleBrandClick(e, product.brand?.slug)}
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
