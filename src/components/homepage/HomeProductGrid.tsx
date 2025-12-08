import React from "react";
import ProductCard from "@/components/ProductCard";
import type { SanityProduct } from "@/types/sanityProduct";

interface HomeProductGridProps {
  products: Array<SanityProduct>;
  count?: number;
  columns?: "2" | "4" | "4-lg" | "auto"; // "auto" = 2 on mobile, 4 on xl; "4-lg" = 4 on lg+
}

export default function HomeProductGrid({
  products,
  count,
  columns = "auto",
}: HomeProductGridProps) {
  // Slice the products array to the specified count, or show all if no count provided
  const displayProducts = count ? products.slice(0, count) : products;

  const gridClass =
    columns === "2"
      ? "grid grid-cols-2 gap-2"
      : columns === "4"
      ? "grid grid-cols-2 xl:grid-cols-4 gap-2"
      : columns === "4-lg"
      ? "grid grid-cols-2 lg:grid-cols-4 gap-2"
      : "grid grid-cols-2 xl:grid-cols-4 gap-2"; // auto

  return (
    <div className={gridClass}>
      {displayProducts?.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          className="w-full"
          sizes="(max-width: 1280px) 50vw, 25vw"
        />
      ))}
    </div>
  );
}
