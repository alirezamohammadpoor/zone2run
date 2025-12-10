"use client";
import React from "react";
import Link from "next/link";
import VariantSelector from "./VariantSelector";
import AddToCart from "./AddToCart";
import ProductTabs from "./ProductTabs";
import Breadcrumbs from "./Breadcrumbs";
import { useProductStore } from "@/store/variantStore";
import type { SanityProduct } from "@/types/sanityProduct";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getBrandUrl } from "@/lib/utils/brandUrls";

interface ProductInfoProps {
  product: SanityProduct;
}

function ProductInfo({ product }: ProductInfoProps) {
  const { selectedVariant } = useProductStore();

  const brandName = product.brand?.name || product.vendor;
  const displayTitle = product.title;
  const price = {
    amount: product.priceRange.minVariantPrice,
    currencyCode: "SEK",
  };

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
          <p className="xl:mt-1 text-xs">
            {formatPrice(price.amount)} {price.currencyCode}
          </p>
        </div>

        {cleanDescription && (
          <p className="mt-4 text-xs text-black whitespace-pre-line xl:w-[90%]">
            {cleanDescription}
          </p>
        )}

        <VariantSelector product={product} />
        <AddToCart product={product} selectedVariant={selectedVariant} />
        <ProductTabs />
      </div>
    </div>
  );
}

export default ProductInfo;
