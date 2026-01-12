"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/types/sanityProduct";
import ProductCardGallery from "@/components/ProductCardGallery";

interface HomeProductCardProps {
  product: SanityProduct & { selectedImage?: { url: string; alt: string } };
}

const HomeProductCard = memo(function HomeProductCard({ product }: HomeProductCardProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push(`/products/${product.handle}`);
  }, [router, product.handle]);

  // Prefetch product page on hover for faster navigation
  const handleMouseEnter = useCallback(() => {
    router.prefetch(`/products/${product.handle}`);
  }, [router, product.handle]);

  // Build images array: selectedImage or mainImage first, then gallery
  const primaryImage = product.selectedImage || product.mainImage;
  const allImages = [
    primaryImage,
    ...(product.gallery || []),
  ].filter(
    (img): img is NonNullable<typeof img> => Boolean(img?.url)
  );

  return (
    <div
      className="w-full aspect-[3/4] flex flex-col hover:cursor-pointer"
      onMouseEnter={handleMouseEnter}
    >
      <div className="w-full h-full relative bg-gray-100">
        <ProductCardGallery
          images={allImages}
          sizes="50vw"
          onNavigate={handleClick}
        />
      </div>
      <div className="mt-2 mb-4">
        <p className="text-xs font-medium">{product.brand?.name}</p>
        <p className="text-xs line-clamp-1">{product.title}</p>
        <p className="text-xs mt-2">
          {product.priceRange.minVariantPrice} {"SEK"}
        </p>
      </div>
    </div>
  );
});

export default HomeProductCard;
