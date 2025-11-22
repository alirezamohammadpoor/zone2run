import React from "react";
import Link from "next/link";
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
}

type GridItem = {
  type: "product" | "image";
  product?: SanityProduct;
  image?: EditorialImage;
  index?: number;
};

export default function ProductGridWithImages({
  products,
  editorialImages = [],
  productsPerImage = 6,
}: ProductGridWithImagesProps) {
  // Get first editorial image if available
  const firstImage =
    editorialImages && editorialImages.length > 0 ? editorialImages[0] : null;
  // Get remaining images (skip first one)
  const remainingImages =
    editorialImages && editorialImages.length > 1
      ? editorialImages.slice(1)
      : [];

  // If no images, fallback to regular ProductGrid
  if (!editorialImages || editorialImages.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-2 mx-2">
        {products?.map((product) => {
          return (
            <Link
              key={`${product._id}-${product.handle}`}
              href={`/products/${product.handle}`}
              className="hover:cursor-pointer"
            >
              <ProductCard product={product} />
            </Link>
          );
        })}
      </div>
    );
  }

  // Create interleaved array of products and remaining images
  // Images appear after every N products (configurable)
  const gridItems: GridItem[] = [];
  let imageIndex = 0;

  for (let i = 0; i < products.length; i++) {
    const productIndex = i + 1; // 1-based index

    // Add the product
    gridItems.push({
      type: "product",
      product: products[i],
      index: i,
    });

    // After every N products, insert an image if available
    if (
      productIndex % productsPerImage === 0 &&
      imageIndex < remainingImages.length
    ) {
      gridItems.push({
        type: "image",
        image: remainingImages[imageIndex],
      });
      imageIndex++;
    }
  }

  return (
    <>
      {/* Render first editorial image */}
      {firstImage && firstImage.image?.asset?.url && (
        <div className="mx-2 mb-4">
          <div className="w-full h-[50vh] relative bg-gray-100 my-2">
            <Image
              src={urlFor(firstImage.image).url()}
              alt={
                firstImage.image.alt || firstImage.caption || "Editorial image"
              }
              fill
              className="object-cover"
              sizes="100vw"
            />
            {firstImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                {firstImage.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Then render product grid with remaining images interspersed */}
      <div className="grid grid-cols-2 gap-2 mx-2">
        {gridItems.map((item, idx) => {
          if (item.type === "product" && item.product) {
            return (
              <Link
                key={`${item.product._id}-${item.product.handle}-${idx}`}
                href={`/products/${item.product.handle}`}
                className="hover:cursor-pointer"
              >
                <ProductCard product={item.product} />
              </Link>
            );
          }

          if (item.type === "image" && item.image) {
            const imageUrl = item.image.image?.asset?.url;
            if (!imageUrl) return null;

            return (
              <div
                key={item.image._key || idx}
                className="col-span-2 w-full h-[50vh] relative bg-gray-100 my-2"
              >
                <Image
                  src={urlFor(item.image.image).url()}
                  alt={
                    item.image.image.alt ||
                    item.image.caption ||
                    "Editorial image"
                  }
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                {item.image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                    {item.image.caption}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </>
  );
}
