"use client";

import { memo, useState } from "react";
import { formatPrice } from "@/lib/utils/formatPrice";
import ProductCardGallery from "./ProductCardGallery";

import type { CardProduct } from "@/types/cardProduct";

interface ProductCardProps {
  product: CardProduct;
  sizes?: string;
  className?: string;
  priority?: boolean;
  disableGallery?: boolean;
  availableSizes?: string[];
}

const ProductCard = memo(function ProductCard({
  product,
  sizes = "(max-width: 1279px) calc(50vw - 12px), calc(25vw - 10px)",
  className = "",
  priority = false,
  disableGallery = false,
  availableSizes,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // images[0] = main image, rest = gallery (combined at GROQ level)
  const allImages = (product.images || []).filter((img) => Boolean(img?.url));

  const brandName = product.brand?.name || product.vendor || "";
  const price = formatPrice(product.priceRange.minVariantPrice);

  const showSizes = isHovered && availableSizes && availableSizes.length > 0;

  return (
    <article
      className={`aspect-[4/5] flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full relative bg-gray-100 block">
        <ProductCardGallery
          images={allImages}
          sizes={sizes}
          priority={priority}
          disableGallery={disableGallery}
        />
      </div>
      <div className="pt-2 pb-4">
        {/* Desktop hover: swap brand → "Available in", title → sizes */}
        {showSizes ? (
          <>
            <p className="hidden xl:block text-xs font-medium">Available in</p>
            <p className="hidden xl:flex xl:flex-wrap xl:gap-x-2 text-xs line-clamp-1">
              {availableSizes.join("  ")}
            </p>
            {/* Mobile: always show default */}
            <p className="xl:hidden text-xs font-medium">{brandName}</p>
            <p className="xl:hidden text-xs line-clamp-1">{product.title}</p>
          </>
        ) : (
          <>
            <p className="text-xs font-medium">
              {brandName}
            </p>
            <p className="text-xs line-clamp-1">
              {product.title}
            </p>
          </>
        )}
        <p className="text-xs pt-2">
          {price} SEK
        </p>
      </div>
    </article>
  );
});

export default ProductCard;
