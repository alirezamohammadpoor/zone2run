"use client";

import Link from "next/link";
import { useRecentlyViewedStore } from "@/lib/recentlyViewed/store";
import { useHasMounted } from "@/hooks/useHasMounted";
import ProductCard from "./ProductCard";
import type { SanityProduct } from "@/types/sanityProduct";

interface RecentlyViewedSectionProps {
  /** Maximum number of products to display */
  maxProducts?: number;
  /** Handle to exclude (e.g., current product on PDP) */
  excludeHandle?: string;
  /** Callback when modal should close (for SearchModal integration) */
  onProductClick?: () => void;
}

export default function RecentlyViewedSection({
  maxProducts = 4,
  excludeHandle,
  onProductClick,
}: RecentlyViewedSectionProps) {
  const products = useRecentlyViewedStore((state) => state.products);
  const hasMounted = useHasMounted();

  // Don't render until client-side hydration completes
  if (!hasMounted) return null;

  // Filter out excluded product and limit count
  const displayProducts = products
    .filter((p) => p.handle !== excludeHandle)
    .slice(0, maxProducts);

  // Don't render section if no products
  if (displayProducts.length === 0) return null;

  return (
    <div className="mt-8">
      <span className="text-gray-500 text-xs block mb-4">Recently viewed</span>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {displayProducts.map((product) => (
          <Link
            key={product.handle}
            href={`/products/${product.handle}`}
            onClick={onProductClick}
          >
            <ProductCard
              product={product as unknown as SanityProduct}
              sizes="(max-width: 768px) 50vw, 25vw"
              disableGallery
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
