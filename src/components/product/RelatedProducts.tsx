"use client";

import { memo } from "react";
import LocaleLink from "@/components/LocaleLink";
import ProductCarousel from "@/components/ProductCarousel";
import ProductGrid from "@/components/ProductGrid";
import type { CardProduct } from "@/types/cardProduct";
import { getBrandUrl } from "@/lib/utils/brandUrls";
import { CAROUSEL_CARD_SIZES } from "@/lib/utils/gridSizes";

interface RelatedProductsProps {
  products: CardProduct[];
  brandName: string;
  brandSlug: string;
  displayType?: "grid" | "carousel";
}

const RelatedProducts = memo(function RelatedProducts({
  products,
  brandName,
  brandSlug,
  displayType = "carousel",
}: RelatedProductsProps) {
  if (!products?.length) return null;

  // px-2, not ml-2 + w-full: that rendered 8px wider than the viewport
  return (
    <div className="px-2 my-8 md:my-12 xl:my-16 w-full">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-black text-xl">More from {brandName}</h2>
        <LocaleLink
          href={getBrandUrl(brandSlug)}
          className="text-black text-sm hover:underline cursor-pointer"
        >
          View All
        </LocaleLink>
      </div>

      {displayType === "grid" ? (
        <ProductGrid products={products} columns="site" />
      ) : (
        <ProductCarousel
          products={products}
          cardClassName="w-carousel-card"
          sizes={CAROUSEL_CARD_SIZES}
        />
      )}
    </div>
  );
});

export default RelatedProducts;
