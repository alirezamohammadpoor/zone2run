"use client";

import { memo } from "react";
import Link from "next/link";
import ProductCarousel from "@/components/ProductCarousel";
import HomeProductGrid from "@/components/homepage/HomeProductGrid";
import type { SanityProduct } from "@/types/sanityProduct";
import { getBrandUrl } from "@/lib/utils/brandUrls";

interface RelatedProductsProps {
  products: SanityProduct[];
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
        <Link
          href={getBrandUrl(brandSlug)}
          prefetch={true}
          className="text-black text-sm hover:underline cursor-pointer mr-4"
        >
          View All
        </Link>
      </div>

      {displayType === "grid" ? (
        <HomeProductGrid products={products} />
      ) : (
        <ProductCarousel
          products={products}
          cardClassName="flex-shrink-0 w-[70vw] xl:w-[30vw] aspect-[4/5]"
          sizes="(min-width: 1280px) 25vw, 70vw"
        />
      )}
    </div>
  );
});

export default RelatedProducts;
