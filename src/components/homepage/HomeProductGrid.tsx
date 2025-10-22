import React from "react";
import Link from "next/link";
import HomeProductCard from "./HomeProductCard";
import type { SanityProduct } from "@/types/sanityProduct";

interface HomeProductGridProps {
  products: Array<SanityProduct>;
  count?: number;
}

export default function HomeProductGrid({
  products,
  count,
}: HomeProductGridProps) {
  // Slice the products array to the specified count, or show all if no count provided
  const displayProducts = count ? products.slice(0, count) : products;

  return (
    <div className="grid grid-cols-2 gap-2">
      {displayProducts?.map((product) => {
        return (
          <Link
            key={product._id}
            href={`/products/${product.handle}`}
            className="hover:cursor-pointer"
          >
            <HomeProductCard product={product} />
          </Link>
        );
      })}
    </div>
  );
}
