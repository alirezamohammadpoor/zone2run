"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/types/sanityProduct";
import ProductCardGallery from "@/components/ProductCardGallery";
import { formatPrice } from "@/lib/utils/formatPrice";

interface HomeProductCardProps {
  product: SanityProduct & { selectedImage?: { url: string; alt: string } };
}

const HomeProductCard = memo(function HomeProductCard({ product }: HomeProductCardProps) {
  const router = useRouter();

  const handleNavigate = useCallback(() => {
    router.push(`/products/${product.handle}`);
  }, [router, product.handle]);

  // Build images array: selectedImage or mainImage first, then gallery
  const primaryImage = product.selectedImage || product.mainImage;
  const allImages = [
    primaryImage,
    ...(product.gallery || []),
  ].filter(
    (img): img is NonNullable<typeof img> => Boolean(img?.url)
  );

  const brandName = product.brand?.name || "";
  const price = formatPrice(product.priceRange.minVariantPrice);

  return (
    <article className="w-full aspect-[3/4] flex flex-col">
      <div
        className="w-full h-full relative bg-gray-100 cursor-pointer"
        role="link"
        tabIndex={0}
        aria-label={`${brandName ? `${brandName}: ` : ""}${product.title}, ${price} SEK. View product details`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNavigate();
          }
        }}
      >
        <ProductCardGallery
          images={allImages}
          sizes="50vw"
          onNavigate={handleNavigate}
        />
      </div>
      <div className="mt-2 mb-4">
        <p className="text-xs font-medium">{brandName}</p>
        <button
          type="button"
          className="text-xs line-clamp-1 hover:underline cursor-pointer text-left"
          onClick={handleNavigate}
        >
          {product.title}
        </button>
        <p className="text-xs mt-2">
          {price} SEK
        </p>
      </div>
    </article>
  );
});

export default HomeProductCard;
