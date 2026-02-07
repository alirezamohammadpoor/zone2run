import { type PortableTextModule } from "../../../sanity.types";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import LocaleLink from "@/components/LocaleLink";
import Image from "next/image";
import ProductGrid from "@/components/ProductGrid";
import ProductCarousel from "@/components/ProductCarousel";
import { getBlurProps } from "@/lib/utils/imageProps";
import type { CardProduct } from "@/types/cardProduct";

interface ContentModuleProps {
  contentModule: PortableTextModule;
  products?: CardProduct[];
}

// Section spacing for consistent margins between modules
const SECTION_SPACING = "my-8 md:my-12 xl:my-16";

// Shared text content renderer
function TextContent({ module }: { module: PortableTextModule }) {
  return (
    <div
      className={`${module.maxWidth || "max-w-4xl"} ${module.textAlign || "text-left"}`}
    >
      {module.title && <h2 className="text-sm mb-4">{module.title}</h2>}
      {module.content && (
        <PortableTextRenderer
          value={module.content}
          className="text-xs w-full xl:w-[30vw]"
        />
      )}
      {module.link && (
        <LocaleLink
          href={module.link}
          className="text-xs mt-2 flex items-center cursor-pointer underline"
        >
          {module.linkText}
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
        </LocaleLink>
      )}
      {module.source && (
        <p className="text-xs text-gray-500 mt-2">{module.source}</p>
      )}
    </div>
  );
}

// Shared media renderer (image or video)
function MediaContent({ module }: { module: PortableTextModule }) {
  const mediaHeight = module.mediaHeight || "70vh";

  if (module.mediaType === "video" && module.video) {
    const video = module.video as { asset?: { url?: string } };
    if (!video.asset?.url) return null;

    return (
      <div
        className="relative overflow-hidden w-full xl:w-[50vw] flex-shrink-0"
        style={{ height: mediaHeight, minHeight: mediaHeight }}
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

  if (module.mediaType === "image" && module.image) {
    const hotspot = module.image.hotspot;
    const objectPosition =
      hotspot?.x !== undefined && hotspot?.y !== undefined
        ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
        : "center center";

    const imageWithLqip = module.image as {
      asset?: { url?: string; metadata?: { lqip?: string } };
      alt?: string;
    };

    return (
      <div
        className="relative overflow-hidden w-full xl:w-[50vw] flex-shrink-0"
        style={{ height: mediaHeight, minHeight: mediaHeight }}
      >
        <Image
          src={imageWithLqip.asset?.url || ""}
          alt={module.image.alt || ""}
          fill
          className="object-cover"
          style={{ objectPosition }}
          sizes="(max-width: 768px) 100vw, 50vw"
          {...getBlurProps(imageWithLqip)}
        />
      </div>
    );
  }

  return null;
}

// Shared products renderer (grid or carousel)
function ProductsContent({
  module,
  products,
  isSplit = false,
}: {
  module: PortableTextModule;
  products: CardProduct[];
  isSplit?: boolean;
}) {
  const mobileDisplayType = module.displayType || "horizontal";
  const desktopDisplayType = module.displayTypeDesktop || mobileDisplayType;
  const hasDifferentLayouts = mobileDisplayType !== desktopDisplayType;

  const containerClass = isSplit
    ? "w-full xl:w-[50vw] flex-shrink-0"
    : "w-full";

  const renderHeader = () =>
    (module.featuredHeading || module.featuredButtonText) && (
      <div className="flex justify-between items-center mb-4">
        {module.featuredHeading && (
          <h2 className="text-black text-sm">{module.featuredHeading}</h2>
        )}
        {module.featuredButtonText && (
          <LocaleLink
            href={module.featuredButtonLink || "/products"}
            className="text-black text-xs hover:underline cursor-pointer"
          >
            {module.featuredButtonText}
          </LocaleLink>
        )}
      </div>
    );

  const renderGrid = () => (
    <ProductGrid
      products={products}
      count={
        module.productCount && module.productCount > 0
          ? module.productCount
          : undefined
      }
      columns={isSplit ? "2" : "auto"}
    />
  );

  const renderHorizontal = () => <ProductCarousel products={products} />;

  // Same layout for both breakpoints
  if (!hasDifferentLayouts) {
    return (
      <div className={containerClass}>
        {renderHeader()}
        {mobileDisplayType === "grid" ? renderGrid() : renderHorizontal()}
      </div>
    );
  }

  // Different layouts per breakpoint
  return (
    <div className={containerClass}>
      {renderHeader()}
      <div className="block xl:hidden">
        {mobileDisplayType === "grid" ? renderGrid() : renderHorizontal()}
      </div>
      <div className="hidden xl:block">
        {desktopDisplayType === "grid" ? renderGrid() : renderHorizontal()}
      </div>
    </div>
  );
}

// Two-column split layout wrapper (left = media/products, right = text)
function TwoColumnLayout({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className={`w-full ${SECTION_SPACING}`}>
      <div className="flex flex-col xl:flex-row xl:items-center gap-8">
        <div className="px-2 order-2 xl:order-1 xl:mr-16">{left}</div>
        <div className="px-2 xl:px-0 xl:pr-2 order-1 xl:order-2 flex items-center">
          {right}
        </div>
      </div>
    </div>
  );
}

export default function ContentModuleComponent({
  contentModule,
  products,
}: ContentModuleProps) {
  const contentType = contentModule.contentType || "text-only";
  const productsWithImages = products || [];

  // Layout 1: Text Only
  if (contentType === "text-only") {
    return (
      <div className={`w-full px-2 ${SECTION_SPACING}`}>
        <TextContent module={contentModule} />
      </div>
    );
  }

  // Layout 2: Products Only
  if (contentType === "products-only") {
    return (
      <div className={`w-full px-2 ${SECTION_SPACING}`}>
        <ProductsContent module={contentModule} products={productsWithImages} />
      </div>
    );
  }

  // Layout 3: Media + Text (media left, text right)
  if (contentType === "media-text") {
    return (
      <TwoColumnLayout
        left={<MediaContent module={contentModule} />}
        right={<TextContent module={contentModule} />}
      />
    );
  }

  // Layout 4: Products + Text (products left, text right)
  if (contentType === "products-text") {
    return (
      <TwoColumnLayout
        left={
          <ProductsContent
            module={contentModule}
            products={productsWithImages}
            isSplit
          />
        }
        right={<TextContent module={contentModule} />}
      />
    );
  }

  // Fallback for legacy content types (backwards compatibility)
  // Maps old values to new layouts
  if (contentType === "text-with-media") {
    return (
      <TwoColumnLayout
        left={<MediaContent module={contentModule} />}
        right={<TextContent module={contentModule} />}
      />
    );
  }

  if (contentType === "text-with-products") {
    return (
      <TwoColumnLayout
        left={
          <ProductsContent
            module={contentModule}
            products={productsWithImages}
            isSplit
          />
        }
        right={<TextContent module={contentModule} />}
      />
    );
  }

  if (contentType === "media-with-products") {
    // Legacy: render as media + text (no products)
    return (
      <TwoColumnLayout
        left={<MediaContent module={contentModule} />}
        right={<TextContent module={contentModule} />}
      />
    );
  }

  // Final fallback: text only
  return (
    <div className={`w-full px-2 ${SECTION_SPACING}`}>
      <TextContent module={contentModule} />
    </div>
  );
}
