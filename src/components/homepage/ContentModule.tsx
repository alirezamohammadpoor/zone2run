import { type PortableTextModule } from "../../../sanity.types";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import Link from "next/link";
import Image from "next/image";
import ProductGrid from "@/components/ProductGrid";
import ProductCarousel from "@/components/ProductCarousel";
import { getBlurProps } from "@/lib/utils/imageProps";
import type { CardProduct } from "@/types/cardProduct";

function ContentModuleComponent({
  contentModule,
  products,
}: {
  contentModule: PortableTextModule;
  products?: CardProduct[];
}) {
  const contentType = contentModule.contentType || "text-only";
  const layout = contentModule.layout || "single";
  const isSplitLayout = layout === "split";
  const isFullWidth = layout === "full-width";

  // Products now come pre-processed from server with images already ordered
  const productsWithImages = products || [];

  // Render media (image or video)
  const renderMedia = () => {
    if (
      contentType !== "text-with-media" &&
      contentType !== "media-with-products"
    )
      return null;

    const mediaHeight = contentModule.mediaHeight || "70vh";

    if (contentModule.mediaType === "video" && contentModule.video) {
      const video = contentModule.video as {
        asset?: { url?: string };
      };
      if (!video.asset?.url) return null;

      return (
        <div
          className={`relative overflow-hidden flex-shrink-0 ${
            isFullWidth
              ? "w-full"
              : isSplitLayout
                ? "w-full xl:w-[50vw]"
                : "w-full"
          }`}
          style={{
            height: mediaHeight,
            minHeight: mediaHeight,
          }}
        >
          <video
            src={video.asset.url}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      );
    }

    if (contentModule.mediaType === "image" && contentModule.image) {
      // Get hotspot data for image positioning (defaults to center)
      const hotspot = contentModule.image.hotspot;
      const objectPosition =
        hotspot?.x !== undefined && hotspot?.y !== undefined
          ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
          : "center center";

      // Cast for LQIP access from GROQ resolved asset
      const imageWithLqip = contentModule.image as {
        asset?: { url?: string; metadata?: { lqip?: string } };
        alt?: string;
      };

      return (
        <div
          className={`relative overflow-hidden flex-shrink-0 ${
            isFullWidth
              ? "w-full"
              : isSplitLayout
                ? "w-full xl:w-[50vw]"
                : "w-full"
          }`}
          style={{
            height: mediaHeight,
            minHeight: mediaHeight,
          }}
        >
          <Image
            src={imageWithLqip.asset?.url || ""}
            alt={contentModule.image.alt || ""}
            fill
            className="object-cover"
            style={{ objectPosition }}
            sizes={isFullWidth ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
            {...getBlurProps(imageWithLqip)}
          />
        </div>
      );
    }

    return null;
  };

  // Render products
  const renderProducts = () => {
    if (
      contentType !== "text-with-products" &&
      contentType !== "media-with-products" &&
      contentType !== "products-only"
    )
      return null;

    const mobileDisplayType = contentModule.displayType || "horizontal";
    const desktopDisplayType =
      contentModule.displayTypeDesktop || mobileDisplayType;
    const hasDifferentLayouts = mobileDisplayType !== desktopDisplayType;

    // For split media-with-products: products fill remaining space with flex-1
    const isMediaWithProductsSplit =
      isSplitLayout && contentType === "media-with-products";

    const containerClass = `${
      contentType === "products-only"
        ? "w-full"
        : isMediaWithProductsSplit
          ? "w-full xl:w-[50vw] flex-shrink-0"
          : isSplitLayout
            ? "w-full xl:w-[50vw] xl:max-w-[50vw]"
            : "w-full"
    }`;

    const renderHeader = () =>
      (contentModule.featuredHeading || contentModule.featuredButtonText) && (
        <div className="flex justify-between items-center mb-4">
          {contentModule.featuredHeading && (
            <h2 className="text-black text-sm">
              {contentModule.featuredHeading}
            </h2>
          )}
          {contentModule.featuredButtonText && (
            <Link
              href={contentModule.featuredButtonLink || "/products"}
              className="text-black text-xs hover:underline cursor-pointer"
            >
              {contentModule.featuredButtonText}
            </Link>
          )}
        </div>
      );

    const renderGrid = () => (
      <ProductGrid
        products={productsWithImages}
        count={
          contentModule.productCount && contentModule.productCount > 0
            ? contentModule.productCount
            : undefined
        }
        columns={
          isMediaWithProductsSplit ? "3-lg" : isSplitLayout ? "2" : "auto"
        }
      />
    );

    const renderHorizontal = () => (
      <ProductCarousel products={productsWithImages} />
    );

    // If both layouts are the same, render just one
    if (!hasDifferentLayouts) {
      return (
        <div className={containerClass}>
          {renderHeader()}
          {mobileDisplayType === "grid" ? renderGrid() : renderHorizontal()}
        </div>
      );
    }

    // Render both layouts with responsive visibility
    return (
      <div className={containerClass}>
        {renderHeader()}
        {/* Mobile layout */}
        <div className="block xl:hidden">
          {mobileDisplayType === "grid" ? renderGrid() : renderHorizontal()}
        </div>
        {/* Desktop layout */}
        <div className="hidden xl:block">
          {desktopDisplayType === "grid" ? renderGrid() : renderHorizontal()}
        </div>
      </div>
    );
  };

  // Render text content
  const renderContent = () => {
    if (contentType === "products-only") return null;

    // For text-with-products: text is 33vw, products is 50vw
    // For text-with-media: text is 50vw, media is 33vw
    const textWidth =
      isSplitLayout && contentType === "text-with-products"
        ? "w-full xl:w-[50vw] flex-shrink-0"
        : isSplitLayout
          ? "w-full xl:w-[50vw] flex-shrink-0"
          : `${contentModule.maxWidth || "max-w-4xl"} ${
              contentModule.textAlign || "text-left"
            }`;

    return (
      <div className={textWidth}>
        {contentModule.title && (
          <h2 className={`text-sm mb-4 ${isSplitLayout ? "" : "mt-6"}`}>
            {contentModule.title}
          </h2>
        )}
        {contentModule.content && (
          <PortableTextRenderer
            value={contentModule.content}
            className="text-xs w-full xl:w-[30vw]"
          />
        )}
        {contentModule.link && (
          <Link
            href={contentModule.link}
            className="text-xs mt-2 flex items-center cursor-pointer underline"
            rel="noopener noreferrer"
          >
            {contentModule.linkText}
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
        {contentModule.source && (
          <p className="text-xs text-gray-500 mt-2">{contentModule.source}</p>
        )}
      </div>
    );
  };

  // Section spacing class for consistent margins between modules
  const sectionSpacing = "my-8 md:my-12 xl:my-16";

  // Full-width media layout (media on top, text below)
  if (isFullWidth && contentType === "text-with-media") {
    return (
      <div className={`w-full ${sectionSpacing}`}>
        {renderMedia()}
        <div className="px-2 pt-8">{renderContent()}</div>
      </div>
    );
  }

  // Split layout (side-by-side on larger screens, stacked on mobile)
  if (isSplitLayout) {
    if (contentType === "text-with-media") {
      // Media on left, text on right (center aligned)
      return (
        <div className={`w-full ${sectionSpacing}`}>
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-8">
            {renderMedia()}
            <div className="px-2 xl:px-0 xl:pr-2">{renderContent()}</div>
          </div>
        </div>
      );
    }

    if (contentType === "text-with-products") {
      // Products on left, text on right (center aligned)
      // Mobile: text first (order-1), products second (order-2)
      // Desktop: products left (order-1), text right (order-2)
      return (
        <div className={`w-full ${sectionSpacing}`}>
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-8">
            <div className="px-2 order-2 xl:order-1">{renderProducts()}</div>
            <div className="px-2 xl:px-0 xl:pr-2 order-1 xl:order-2">
              {renderContent()}
            </div>
          </div>
        </div>
      );
    }

    if (contentType === "media-with-products") {
      // Media + Products layout: side by side (same spacing as media + text)
      return (
        <div className={`w-full ${sectionSpacing}`}>
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-8">
            {renderMedia()}
            <div className="px-2 xl:px-0 xl:pr-2">{renderProducts()}</div>
          </div>
        </div>
      );
    }
  }

  // Single column layout or products-only
  if (contentType === "products-only") {
    return (
      <div className={`w-full px-2 ${sectionSpacing}`}>{renderProducts()}</div>
    );
  }

  // Single column media-with-products
  if (contentType === "media-with-products") {
    return (
      <div className={`w-full ${sectionSpacing}`}>
        {renderMedia()}
        <div className="px-2 pt-8">{renderProducts()}</div>
      </div>
    );
  }

  // Text with media - media on top, text below
  if (contentType === "text-with-media") {
    return (
      <div className={`w-full ${sectionSpacing}`}>
        {renderMedia()}
        <div className="px-2 pt-8">{renderContent()}</div>
      </div>
    );
  }

  // Text with products - products on top, text below
  if (contentType === "text-with-products") {
    return (
      <div className={`w-full ${sectionSpacing}`}>
        <div className="px-2">{renderProducts()}</div>
        <div className="px-2 pt-8">{renderContent()}</div>
      </div>
    );
  }

  // Text only
  return (
    <div className={`w-full px-2 ${sectionSpacing}`}>{renderContent()}</div>
  );
}

export default ContentModuleComponent;
