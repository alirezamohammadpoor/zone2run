import { memo } from "react";
import LocaleLink from "@/components/LocaleLink";
import ProductCard from "./ProductCard";
import type { CardProduct } from "@/types/cardProduct";

interface ProductGridProps {
  products: CardProduct[];
  count?: number;
  className?: string;
  /** Number of images to load with priority (above-fold optimization) */
  priorityCount?: number;
  /** Responsive column layout. When provided, overrides className. */
  columns?: "2" | "2-lg" | "3-lg" | "4" | "4-lg" | "auto";
  /** Image sizes hint for responsive loading */
  sizes?: string;
}

const COLUMN_CLASSES: Record<string, string> = {
  "2": "grid grid-cols-2 gap-2",
  "2-lg": "grid grid-cols-2 gap-2",
  "3-lg": "grid grid-cols-2 lg:grid-cols-3 gap-2",
  "4": "grid grid-cols-2 xl:grid-cols-4 gap-2",
  "4-lg": "grid grid-cols-2 lg:grid-cols-4 gap-2",
  auto: "grid grid-cols-2 xl:grid-cols-4 gap-2",
};

const ProductGrid = memo(function ProductGrid({
  products,
  count,
  className,
  priorityCount = 0,
  columns,
  sizes,
}: ProductGridProps) {
  const displayProducts = count ? products.slice(0, count) : products;

  const gridClass = columns
    ? COLUMN_CLASSES[columns]
    : className ?? "grid grid-cols-2 xl:grid-cols-4 gap-2 px-2 my-8 md:my-12 xl:my-16";

  return (
    <div className={gridClass}>
      {displayProducts?.map((product, index) => (
        <LocaleLink
          key={`${product._id}-${product.handle}`}
          href={`/products/${product.handle}`}
        >
          <ProductCard
            product={product}
            sizes={sizes ?? "(max-width: 1279px) calc(50vw - 12px), calc(25vw - 10px)"}
            priority={index < priorityCount}
            availableSizes={product.sizes}
          />
        </LocaleLink>
      ))}
    </div>
  );
});

export default ProductGrid;
