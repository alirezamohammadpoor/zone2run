import { memo } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { SanityProduct } from "@/types/sanityProduct";
import type { PLPProduct } from "@/types/plpProduct";

type ProductGridProduct = SanityProduct | PLPProduct;

interface ProductGridProps {
  products: ProductGridProduct[];
  count?: number;
  className?: string;
  /** Number of images to load with priority (above-fold optimization) */
  priorityCount?: number;
}

const ProductGrid = memo(function ProductGrid({
  products,
  count,
  className,
  priorityCount = 0,
}: ProductGridProps) {
  const displayProducts = count ? products.slice(0, count) : products;

  return (
    <div className={className ?? "grid grid-cols-2 xl:grid-cols-4 gap-2 px-2 my-8 md:my-12 xl:my-16"}>
      {displayProducts?.map((product, index) => (
        <Link
          key={`${product._id}-${product.handle}`}
          href={`/products/${product.handle}`}
        >
          <ProductCard
            product={product}
            sizes="(max-width: 1280px) 50vw, 25vw"
            priority={index < priorityCount}
          />
        </Link>
      ))}
    </div>
  );
});

export default ProductGrid;
