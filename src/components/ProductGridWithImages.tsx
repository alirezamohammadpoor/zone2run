import Image from "next/image";
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
  priorityCount?: number;
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

  const getClassName = () => {
    if (isMobile) {
      return "col-span-2 w-full aspect-[4/5] relative";
    }
    if (gridLayout === "3col") {
      return "w-full aspect-[4/5] relative";
    }
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
  priorityCount = 0,
}: {
  gridItems: GridItem[];
  isMobile: boolean;
  gridLayout?: "4col" | "3col";
  priorityCount?: number;
}) {
  let productIndex = 0;
  return (
    <>
      {gridItems.map((item, idx) => {
        if (item.type === "product" && item.product) {
          const isPriority = productIndex < priorityCount;
          productIndex++;
          return (
            <article key={`${item.product._id}-${idx}`}>
              <ProductCard product={item.product} priority={isPriority} />
            </article>
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
  priorityCount = 4,
}: ProductGridWithImagesProps) {
  const xlGridCols =
    gridLayout === "3col" ? "xl:grid-cols-3" : "xl:grid-cols-4";

  // If no images, fallback to regular ProductGrid
  if (!editorialImages || editorialImages.length === 0) {
    return (
      <div
        className={`grid grid-cols-2 ${xlGridCols} gap-2 px-2 my-8 md:my-12 xl:my-16`}
      >
        {products?.map((product, idx) => (
          <article key={`${product._id}-${product.handle}`}>
            <ProductCard product={product} priority={idx < priorityCount} />
          </article>
        ))}
      </div>
    );
  }

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
          priorityCount={Math.min(priorityCount, 2)}
        />
      </div>

      {/* XL grid */}
      <div className={`hidden xl:grid ${xlGridCols} gap-2 px-2`}>
        <GridContent
          gridItems={xlGridItems}
          isMobile={false}
          gridLayout={gridLayout}
          priorityCount={priorityCount}
        />
      </div>
    </div>
  );
}
