"use client";

import { useRouter } from "next/navigation";
import type { SanityProduct } from "@/types/sanityProduct";
import ProductCardGallery from "@/components/ProductCardGallery";

interface BlogProductCardProps {
  product: SanityProduct & { selectedImage?: { url: string; alt: string } };
}

export default function BlogProductCard({ product }: BlogProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products/${product.handle}`);
  };

  // Build images array: selectedImage or mainImage first, then gallery
  const primaryImage = product.selectedImage || product.mainImage;
  const allImages = [
    primaryImage,
    ...(product.gallery || []),
  ].filter(
    (img): img is NonNullable<typeof img> => Boolean(img?.url)
  );

  return (
    <div className="w-full aspect-[3/4] flex flex-col hover:cursor-pointer">
      <div className="w-full h-full relative bg-gray-100">
        <ProductCardGallery
          images={allImages}
          sizes="(max-width: 1280px) 50vw, 25vw"
          onNavigate={handleClick}
        />
      </div>
      <div className="mt-2 mb-10">
        <p className="text-xs cursor-pointer font-medium">
          {product.brand?.name}
        </p>
        <p className="text-xs cursor-pointer line-clamp-1">{product.title}</p>
        <p className="text-xs mt-2">
          {product.priceRange.minVariantPrice} {"SEK"}
        </p>
      </div>
    </div>
  );
}
