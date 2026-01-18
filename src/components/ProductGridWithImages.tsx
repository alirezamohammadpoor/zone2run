import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { urlFor } from "@/sanity/lib/image";
import type { SanityProduct } from "@/types/sanityProduct";

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
  products: Array<SanityProduct>;
  editorialImages?: EditorialImage[];
  productsPerImage?: number;
  productsPerImageXL?: number;
  gridLayout?: "4col" | "3col";
}

type GridItem = {
  type: "product" | "image";
  product?: SanityProduct;
  image?: EditorialImage;
  index?: number;
};

// Helper function to create grid items array
function createGridItems(
  products: SanityProduct[],
  editorialImages: EditorialImage[],
  productsPerImage: number
): GridItem[] {
  const gridItems: GridItem[] = [];
  let imageIndex = 0;

  for (let i = 0; i < products.length; i++) {
    const productIndex = i + 1;
    gridItems.push({
      type: "product",
      product: products[i],
      index: i,
    });

    if (
      productIndex % productsPerImage === 0 &&
      imageIndex < editorialImages.length
    ) {
      gridItems.push({
        type: "image",
        image: editorialImages[imageIndex],
      });
      imageIndex++;
    }
  }
  return gridItems;
}

// Render a product item wrapped in Link for prefetch
function ProductItem({
  product,
  idx,
}: {
  product: SanityProduct;
  idx: number;
}) {
  return (
    <Link
      key={`${product._id}-${product.handle}-${idx}`}
      href={`/products/${product.handle}`}
    >
      <ProductCard product={product} />
    </Link>
  );
}

// Render an editorial image
function EditorialImageBlock({
  image,
  idx,
  isMobile,
  gridLayout = "4col",
}: {
  image: EditorialImage;
  idx: number;
  isMobile: boolean;
  gridLayout?: "4col" | "3col";
}) {
  const imageUrl = image.image?.asset?.url;
  if (!imageUrl) return null;

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
    // h-[93.15%] aligns with 2 stacked ProductCards (each aspect-[4/5] + text area below)
    // This value accounts for the text area height (~6.85% of card) so image aligns with card images
    return "col-span-2 row-span-2 w-full h-[94.1%] relative";
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
        sizes={isMobile ? "100vw" : "50vw"}
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
}: ProductGridWithImagesProps) {
  // Determine XL grid columns based on layout
  const xlGridCols =
    gridLayout === "3col" ? "xl:grid-cols-3" : "xl:grid-cols-4";

  // If no images, fallback to regular ProductGrid
  if (!editorialImages || editorialImages.length === 0) {
    return (
      <div
        className={`grid grid-cols-2 ${xlGridCols} gap-2 px-2 my-8 md:my-12 xl:my-16`}
      >
        {products?.map((product) => (
          <Link
            key={`${product._id}-${product.handle}`}
            href={`/products/${product.handle}`}
          >
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    );
  }

  // Create separate grid items for mobile and XL
  const mobileGridItems = createGridItems(
    products,
    editorialImages,
    productsPerImage
  );
  const xlGridItems = createGridItems(
    products,
    editorialImages,
    productsPerImageXL
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

      {/* XL grid */}
      <div className={`hidden xl:grid ${xlGridCols} gap-2 px-2`}>
        <GridContent
          gridItems={xlGridItems}
          isMobile={false}
          gridLayout={gridLayout}
        />
      </div>
    </div>
  );
}
