import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";
import ProductGrid from "./ProductGrid";
import { urlFor } from "@/sanity/lib/image";
import type { CardProduct } from "@/types/cardProduct";

export type EditorialImage = {
  _key: string;
  image: {
    asset: {
      _id: string;
      url: string;
    };
    alt?: string;
  };
  caption?: string;
};

interface ProductGridWithImagesProps {
  products: CardProduct[];
  editorialImages?: EditorialImage[];
  productsPerImage?: number;
  productsPerImageXL?: number;
  gridLayout?: "4col" | "3col";
  /** Whether more products exist beyond what's shown (guards editorial image boundary) */
  hasMore?: boolean;
}

type GridItem = {
  type: "product" | "image";
  product?: CardProduct;
  image?: EditorialImage;
  index?: number;
  imageIndex?: number; // 0-indexed editorial image position (for alternating layout)
};

// Helper function to create grid items array
function createGridItems(
  products: CardProduct[],
  editorialImages: EditorialImage[],
  productsPerImage: number,
  hasMore: boolean,
  /** Minimum products needed after insertion point to show the image */
  minProductsAfter: number = 0
): GridItem[] {
  const gridItems: GridItem[] = [];

  for (let i = 0; i < products.length; i++) {
    // Product position (1-indexed for modulo calculation)
    const globalProductIndex = i + 1;

    gridItems.push({
      type: "product",
      product: products[i],
      index: i,
    });

    // Check if an editorial image should appear after this product
    if (globalProductIndex % productsPerImage === 0) {
      // Calculate which editorial image (0-indexed)
      const imageIndex = Math.floor(globalProductIndex / productsPerImage) - 1;

      // Skip if this is the last visible product and more products exist
      // (prevents row-span-2 image peeking above Load More button)
      const isLastVisible = i === products.length - 1;

      // Skip if not enough remaining products to fill the grid alongside the image
      const productsRemaining = products.length - (i + 1);
      const hasEnoughProducts = hasMore || productsRemaining >= minProductsAfter;

      if (
        imageIndex < editorialImages.length &&
        !(isLastVisible && hasMore) &&
        hasEnoughProducts
      ) {
        gridItems.push({
          type: "image",
          image: editorialImages[imageIndex],
          imageIndex, // Track position for alternating layout
        });
      }
    }
  }
  return gridItems;
}

// Render a product item wrapped in Link for prefetch
function ProductItem({
  product,
  idx,
}: {
  product: CardProduct;
  idx: number;
}) {
  return (
    <Link
      key={`${product._id}-${product.handle}-${idx}`}
      href={`/products/${product.handle}`}
    >
      <ProductCard
        product={product}
        availableSizes={product.sizes}
      />
    </Link>
  );
}

// Render an editorial image
function EditorialImageBlock({
  image,
  idx,
  isMobile,
  gridLayout = "4col",
  imageIndex = 0,
}: {
  image: EditorialImage;
  idx: number;
  isMobile: boolean;
  gridLayout?: "4col" | "3col";
  imageIndex?: number;
}) {
  const imageUrl = image.image?.asset?.url;
  if (!imageUrl) return null;

  // Alternate position: even images on left (default), odd images on right
  const isRightAligned = !isMobile && gridLayout === "4col" && imageIndex % 2 === 1;

  // 3col layout: image same size as product card
  // 4col layout: image spans 2x2
  const getClassName = () => {
    if (isMobile) {
      return "col-span-2 w-full aspect-[4/5] relative";
    }
    if (gridLayout === "3col") {
      return "w-full aspect-[4/5] relative";
    }
    // 4col layout: spans 2x2 grid cells
    // h-[94.1%] aligns with 2 stacked ProductCards (each aspect-[4/5] + text area below)
    // This value accounts for the text area height (~6.85% of card) so image aligns with card images
    // Alternate position: even images start at col 1 (left), odd images start at col 3 (right)
    const baseClass = "col-span-2 row-span-2 w-full h-[94.1%] relative";
    return isRightAligned ? `${baseClass} col-start-3` : baseClass;
  };

  return (
    <div
      key={`${image._key || idx}-${isMobile ? "mobile" : "xl"}`}
      className={getClassName()}
    >
      <Image
        src={urlFor(image.image).url()}
        alt={image.image.alt || image.caption || "Editorial image"}
        fill
        className="object-cover"
        sizes={isMobile ? "calc(100vw - 16px)" : "calc(50vw - 12px)"}
      />
      {image.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
          {image.caption}
        </div>
      )}
    </div>
  );
}

// Helper component to render grid items
function GridContent({
  gridItems,
  isMobile,
  gridLayout = "4col",
}: {
  gridItems: GridItem[];
  isMobile: boolean;
  gridLayout?: "4col" | "3col";
}) {
  return (
    <>
      {gridItems.map((item, idx) => {
        if (item.type === "product" && item.product) {
          return (
            <ProductItem
              key={`${item.product._id}-${idx}`}
              product={item.product}
              idx={idx}
            />
          );
        }

        if (item.type === "image" && item.image) {
          return (
            <EditorialImageBlock
              key={`${item.image._key || idx}`}
              image={item.image}
              idx={idx}
              isMobile={isMobile}
              gridLayout={gridLayout}
              imageIndex={item.imageIndex}
            />
          );
        }

        return null;
      })}
    </>
  );
}

export default function ProductGridWithImages({
  products,
  editorialImages = [],
  productsPerImage = 4,
  productsPerImageXL = 8,
  gridLayout = "4col",
  hasMore = false,
}: ProductGridWithImagesProps) {
  // Determine XL grid columns based on layout
  const xlGridCols =
    gridLayout === "3col" ? "xl:grid-cols-3" : "xl:grid-cols-4";

  // If no images, fallback to simple grid
  if (!editorialImages || editorialImages.length === 0) {
    return (
      <ProductGrid
        products={products}
        className={`grid grid-cols-2 ${xlGridCols} gap-2 px-2 my-8 md:my-12 xl:my-16`}
      />
    );
  }

  // Create separate grid items for mobile and XL
  const mobileGridItems = createGridItems(
    products,
    editorialImages,
    productsPerImage,
    hasMore
  );
  // 4-col: editorial image is 2×2, needs 4 products in adjacent cells
  // 3-col: editorial image is 1×1, no minimum needed
  const xlMinProductsAfter = gridLayout === "4col" ? 4 : 0;
  const xlGridItems = createGridItems(
    products,
    editorialImages,
    productsPerImageXL,
    hasMore,
    xlMinProductsAfter
  );

  return (
    <div className="my-8 md:my-12 xl:my-16">
      {/* Mobile grid */}
      <div className="grid grid-cols-2 gap-2 px-2 xl:hidden">
        <GridContent
          gridItems={mobileGridItems}
          isMobile={true}
          gridLayout={gridLayout}
        />
      </div>

      {/* XL grid — dense fills the 2 cells next to row-span-2 editorial images */}
      <div className={`hidden xl:grid ${xlGridCols} grid-flow-dense gap-2 px-2`}>
        <GridContent
          gridItems={xlGridItems}
          isMobile={false}
          gridLayout={gridLayout}
        />
      </div>
    </div>
  );
}
