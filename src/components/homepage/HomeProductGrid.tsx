import React, { memo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

/**
 * Flexible product shape for grid display.
 * Accepts both full SanityProduct and minimal HomepageProduct.
 */
interface GridProduct {
  _id: string;
  handle: string;
  title: string;
  vendor: string;
  priceRange: { minVariantPrice: number };
  selectedImage?: { url: string; alt: string };
  gallery?: Array<{ url: string; alt?: string }>;
  mainImage?: { url: string; alt: string };
  brand?: { name?: string; slug?: string };
  brandName?: string | null;
  brandSlug?: string | null;
}

interface HomeProductGridProps {
  products: Array<GridProduct>;
  count?: number;
  columns?: "2" | "2-lg" | "3-lg" | "4" | "4-lg" | "auto"; // "auto" = 2 on mobile, 4 on xl; "3-lg" = 3 on lg+; "4-lg" = 4 on lg+
}

const HomeProductGrid = memo(function HomeProductGrid({
  products,
  count,
  columns = "auto",
}: HomeProductGridProps) {
  // Slice the products array to the specified count, or show all if no count provided
  const displayProducts = count ? products.slice(0, count) : products;

  const gridClass =
    columns === "2"
      ? "grid grid-cols-2 gap-2"
      : columns === "3-lg"
      ? "grid grid-cols-2 lg:grid-cols-3 gap-2"
      : columns === "4"
      ? "grid grid-cols-2 xl:grid-cols-4 gap-2"
      : columns === "4-lg"
      ? "grid grid-cols-2 lg:grid-cols-4 gap-2"
      : "grid grid-cols-2 xl:grid-cols-4 gap-2"; // auto

  return (
    <div className={gridClass}>
      {displayProducts?.map((product) => (
        <Link
          key={product._id}
          href={`/products/${product.handle}`}
        >
          <ProductCard
            product={product}
            className="w-full"
            sizes="(max-width: 1280px) 50vw, 25vw"
          />
        </Link>
      ))}
    </div>
  );
});

export default HomeProductGrid;
