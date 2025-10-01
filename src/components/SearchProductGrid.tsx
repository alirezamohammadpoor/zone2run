import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useSearchStore } from "@/store/searchStore";
import type { SanityProduct } from "@/types/sanityProduct";

interface SearchProductGridProps {
  products: Array<SanityProduct>;
}

export default function SearchProductGrid({
  products,
}: SearchProductGridProps) {
  const { setIsSearchOpen } = useSearchStore();
  return (
    <div className="grid grid-cols-2 gap-2 mx-2">
      {products?.slice(0, 6).map((product) => {
        return (
          <Link
            key={product.handle}
            href={`/products/${product.handle}`}
            onClick={() => setIsSearchOpen(false)}
            className="hover:cursor-pointer"
          >
            <ProductCard product={product} />
          </Link>
        );
      })}
    </div>
  );
}
