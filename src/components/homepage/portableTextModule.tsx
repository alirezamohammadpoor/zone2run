"use client";

import { type PortableTextModule } from "../../../sanity.types";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import React, { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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

function PortableTextModuleComponent({
  portableTextModule,
  products,
}: {
  portableTextModule: PortableTextModule;
  products?: SanityProduct[];
}) {
  const router = useRouter();
  const contentType = portableTextModule.contentType || "text-only";
  const layout = portableTextModule.layout || "single";
  const isSplitLayout = layout === "split";
  const isFullWidth = layout === "full-width";

  // Products carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });
  const isDraggingRef = useRef(false);

  // Create a map of products with their selected images
  const productsWithImages = React.useMemo(() => {
    if (!products) return [];

    const productSource = (portableTextModule as any).productSource || "manual";

    // If products come from a collection, they don't have imageSelection
    if (productSource === "collection") {
      return products.map((product) => ({
        product,
        imageSelection: "main" as string,
      }));
    }

    // For manually selected products, use imageSelection from featuredProducts
    if (!portableTextModule.featuredProducts) return [];

    return products.map((product) => {
      const productItem = portableTextModule.featuredProducts?.find(
        (item) => item.product?._ref === product._id
      );

      const imageSelection = productItem?.imageSelection || "main";

      return {
        product,
        imageSelection,
      };
    });
  }, [
    products,
    portableTextModule.featuredProducts,
    (portableTextModule as any).productSource,
  ]);

  // Track dragging state from Embla
  React.useEffect(() => {
    if (
      !emblaApi ||
      contentType === "text-only" ||
      contentType === "text-with-media"
    )
      return;

    const onScroll = () => {
      isDraggingRef.current = true;
    };

    const onSettle = () => {
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
  }, [emblaApi, contentType]);

  const handleProductClick = useCallback(
    (handle: string) => {
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

  // Render media (image or video)
  const renderMedia = () => {
    if (contentType !== "text-with-media") return null;

    const mediaHeight = portableTextModule.mediaHeight || "70vh";

    if (portableTextModule.mediaType === "video" && portableTextModule.video) {
      const video = portableTextModule.video as any;
      return (
        <div
          className={`relative overflow-hidden ${
            isFullWidth
              ? "w-full"
              : isSplitLayout
              ? "w-full lg:w-1/2"
              : "w-full"
          }`}
          style={{
            height: isFullWidth ? mediaHeight : undefined,
            minHeight: isFullWidth ? mediaHeight : undefined,
          }}
        >
          <video
            className="w-full h-full object-cover"
            controls={!isFullWidth}
            autoPlay={isFullWidth}
            muted={isFullWidth}
            loop={isFullWidth}
            playsInline
            preload="metadata"
          >
            <source src={video.asset?.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (portableTextModule.mediaType === "image" && portableTextModule.image) {
      return (
        <div
          className={`relative overflow-hidden ${
            isFullWidth
              ? "w-full"
              : isSplitLayout
              ? "w-full lg:w-1/2"
              : "w-full"
          }`}
          style={{
            height: isFullWidth ? mediaHeight : undefined,
            minHeight: isFullWidth ? mediaHeight : undefined,
          }}
        >
          <Image
            src={urlFor(portableTextModule.image).url()}
            alt={portableTextModule.image.alt || ""}
            fill
            className="object-cover"
            sizes={isFullWidth ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
          />
        </div>
      );
    }

    return null;
  };

  // Render products
  const renderProducts = () => {
    if (contentType !== "text-with-products" && contentType !== "products-only")
      return null;

    const displayType = portableTextModule.displayType || "horizontal";

    return (
      <div
        className={`${
          contentType === "products-only"
            ? "w-full"
            : isSplitLayout
            ? "w-full lg:w-1/2"
            : "w-full"
        }`}
      >
        {(portableTextModule.featuredHeading ||
          portableTextModule.featuredButtonText) && (
          <div className="py-4 flex justify-between items-center">
            {portableTextModule.featuredHeading && (
              <h2 className="text-black text-xl xl:text-2xl">
                {portableTextModule.featuredHeading}
              </h2>
            )}
            {portableTextModule.featuredButtonText && (
              <button
                className="text-black text-sm hover:underline cursor-pointer xl:text-base"
                onClick={() => {
                  router.push(
                    portableTextModule.featuredButtonLink || "/products"
                  );
                }}
              >
                {portableTextModule.featuredButtonText}
              </button>
            )}
          </div>
        )}

        {displayType === "grid" ? (
          <HomeProductGrid
            products={productsWithImages.map(({ product, imageSelection }) => ({
              ...product,
              selectedImage: getSelectedImage(product, imageSelection),
            }))}
            count={
              portableTextModule.productCount &&
              portableTextModule.productCount > 0
                ? portableTextModule.productCount
                : undefined
            }
          />
        ) : (
          <div className="overflow-hidden -mx-2 px-2" ref={emblaRef}>
            <div className="flex gap-2">
              {productsWithImages.map(({ product, imageSelection }) => {
                const selectedImage = getSelectedImage(product, imageSelection);
                return (
                  <div
                    key={product._id}
                    className="flex-shrink-0 w-[70vw] min-w-0 aspect-[3/4] flex flex-col cursor-pointer xl:aspect-[4/5]"
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
                        onClick={(e) =>
                          handleBrandClick(e, product.brand?.slug)
                        }
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
  };

  // Render text content
  const renderContent = () => {
    if (contentType === "products-only") return null;

    return (
      <div
        className={
          isSplitLayout
            ? "flex-1 min-w-0 w-full lg:w-1/2"
            : `${portableTextModule.maxWidth || "max-w-4xl"} ${
                portableTextModule.textAlign || "text-left"
              }`
        }
      >
        {portableTextModule.title && (
          <h2 className="text-xl mb-6 mt-6 xl:text-3xl">
            {portableTextModule.title}
          </h2>
        )}
        {portableTextModule.content && (
          <PortableTextRenderer
            value={portableTextModule.content}
            className="text-sm xl:text-base"
          />
        )}
        {portableTextModule.link && (
          <Link
            href={portableTextModule.link}
            className="text-sm mt-2 flex items-center cursor-pointer underline xl:text-base"
            rel="noopener noreferrer"
          >
            {portableTextModule.linkText}
            <svg
              aria-hidden="true"
              viewBox="0 0 5 8"
              className="w-3 h-3 ml-1 mt-0.25 text-black"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.707107 7.70711L0 7L3.14645 3.85355L0 0.707107L0.707107 0L4.56066 3.85355L0.707107 7.70711Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        )}
        {portableTextModule.source && (
          <p className="text-sm text-gray-500 mt-2 xl:text-base">
            {portableTextModule.source}
          </p>
        )}
      </div>
    );
  };

  // Full-width media layout (media on top, text below)
  if (isFullWidth && contentType === "text-with-media") {
    return (
      <div className="w-full">
        {renderMedia()}
        <div className="px-2 py-8">{renderContent()}</div>
      </div>
    );
  }

  // Split layout (side-by-side on larger screens, stacked on mobile)
  if (isSplitLayout) {
    const isMediaLeft = portableTextModule.mediaPosition === "left";
    // Products on RIGHT by default (so text is on LEFT)
    const productPositionValue = (portableTextModule as any).productPosition;
    const isProductsLeft = productPositionValue === "left";

    if (contentType === "text-with-media") {
      return (
        <div className="w-full px-2 py-2">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {isMediaLeft && renderMedia()}
            {renderContent()}
            {!isMediaLeft && renderMedia()}
          </div>
        </div>
      );
    }

    if (contentType === "text-with-products") {
      // Text on left, products on right (default)
      // Unless productPosition is explicitly set to "left"
      return (
        <div className="w-full px-2 py-2">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {isProductsLeft ? (
              <>
                {renderProducts()}
                {renderContent()}
              </>
            ) : (
              <>
                {renderContent()}
                {renderProducts()}
              </>
            )}
          </div>
        </div>
      );
    }
  }

  // Single column layout or products-only
  if (contentType === "products-only") {
    return <div className="w-full px-2 py-2">{renderProducts()}</div>;
  }

  // Text only or single column with media/products
  return (
    <div className="w-full px-2 py-2">
      <div className="flex flex-col gap-8">
        {contentType === "text-with-media" && renderMedia()}
        {contentType === "text-with-products" && renderProducts()}
        {renderContent()}
      </div>
    </div>
  );
}

export default PortableTextModuleComponent;
