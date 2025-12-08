"use client";

import { type FeaturedProductsModule } from "../../../sanity.types";
import React, { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import HomeProductGrid from "./HomeProductGrid";
import ProductCard from "@/components/ProductCard";
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

    const onScroll = () => {
      isDraggingRef.current = true;
    };

    const onSettle = () => {
      // Reset after carousel settles
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 100);
    };

    emblaApi.on("scroll", onScroll);
    emblaApi.on("settle", onSettle);

    return () => {
      emblaApi.off("scroll", onScroll);
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
    (slug: string) => {
      if (!isDraggingRef.current) {
        router.push(getBrandUrl(slug));
      }
    },
    [router]
  );

  return (
    <div className="px-2 py-4 w-full">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-black text-xl xl:text-2xl">
          {featuredProductsModule.featuredHeading}
        </h2>
        <button
          className="text-black text-sm hover:underline cursor-pointer xl:text-base"
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
                <ProductCard
                  key={product._id}
                  product={{
                    ...product,
                    selectedImage,
                  }}
                  className="flex-shrink-0 w-[70vw] min-w-0"
                  sizes="(max-width: 768px) 70vw, 33vw"
                  onClick={() => handleProductClick(product.handle)}
                  onBrandClick={handleBrandClick}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default FeaturedProductsModule;
