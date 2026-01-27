"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import ProductTabs from "./ProductTabs";
import Breadcrumbs from "./Breadcrumbs";
import type { SanityProduct } from "@/types/sanityProduct";
import { getBrandUrl } from "@/lib/utils/brandUrls";
import { useTrackRecentlyViewed } from "@/hooks/useTrackRecentlyViewed";

interface ProductInfoProps {
  product: SanityProduct;
  priceSlot?: ReactNode;
  children?: ReactNode;
}

function ProductInfo({ product, priceSlot, children }: ProductInfoProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Track product view for recently viewed feature
  useTrackRecentlyViewed(product);

  const brandName = product.brand?.name || product.vendor;
  const displayTitle = product.title;

  // Strip HTML tags from description
  const cleanDescription = product.description
    ?.replace(/<p>/g, "")
    .replace(/<\/p>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .trim();

  return (
    <div className="w-full px-2 xl:w-1/2 xl:flex xl:flex-col xl:justify-center xl:items-center">
      <div className="w-full xl:max-w-md">
        <Breadcrumbs product={product} />
        <div className="flex justify-between items-center mt-2 xl:mt-2">
          {product.brand?.slug ? (
            <Link
              href={getBrandUrl(product.brand.slug)}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              {brandName}
            </Link>
          ) : (
            <p className="text-xs font-semibold">{brandName}</p>
          )}
        </div>
        <div className="flex justify-between items-center xl:block">
          <p className="w-[70%] xl:w-full text-xs">{displayTitle}</p>
          {priceSlot}
        </div>

        {cleanDescription && (
          <div className="mt-4">
            <p
              className={`text-xs text-black whitespace-pre-line xl:w-[100%] ${
                !isDescriptionExpanded ? "line-clamp-3" : ""
              }`}
            >
              {cleanDescription}
            </p>
            {cleanDescription.length > 150 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs text-gray-500 hover:text-black mt-1 underline"
              >
                {isDescriptionExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Children slot for Shopify data (variants, add-to-cart) */}
        {children}
        <ProductTabs />
      </div>
    </div>
  );
}

export default ProductInfo;
