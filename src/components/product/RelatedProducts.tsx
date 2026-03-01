"use client";

import { memo } from "react";
import LocaleLink from "@/components/LocaleLink";
import ProductCarousel from "@/components/ProductCarousel";
import ProductGrid from "@/components/ProductGrid";
import type { CardProduct } from "@/types/cardProduct";
import { getBrandUrl } from "@/lib/utils/brandUrls";

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

  return (
    <div className="ml-2 my-8 md:my-12 xl:my-16 w-full">
      <div className="py-4 flex justify-between items-center">
        <h2 className="text-black text-xl">More from {brandName}</h2>
        <LocaleLink
          href={getBrandUrl(brandSlug)}
          className="text-black text-sm hover:underline cursor-pointer mr-4"
        >
          View All
        </LocaleLink>
      </div>

      {displayType === "grid" ? (
        <ProductGrid products={products} />
      ) : (
        <ProductCarousel
          products={products}
          cardClassName="flex-shrink-0 w-[70vw] xl:w-[30vw] aspect-[4/5]"
          sizes="(min-width: 1280px) 30vw, 70vw"
        />
      )}
    </div>
  );
});

export default RelatedProducts;
