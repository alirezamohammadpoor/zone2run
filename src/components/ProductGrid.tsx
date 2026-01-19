import { memo } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { SanityProduct } from "@/types/sanityProduct";

interface ProductGridProps {
  products: Array<SanityProduct & { selectedImage?: { url: string; alt: string } }>;
  count?: number;
  className?: string;
}

const ProductGrid = memo(function ProductGrid({
  products,
  count,
  className,
}: ProductGridProps) {
  const displayProducts = count ? products.slice(0, count) : products;

  return (
    <div className={className ?? "grid grid-cols-2 xl:grid-cols-4 gap-2 px-2 my-8 md:my-12 xl:my-16"}>
      {displayProducts?.map((product) => (
        <Link
          key={`${product._id}-${product.handle}`}
          href={`/products/${product.handle}`}
        >
          <ProductCard
            product={product}
            sizes="(max-width: 1280px) 50vw, 25vw"
          />
        </Link>
      ))}
    </div>
  );
});

export default ProductGrid;
