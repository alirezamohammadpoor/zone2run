import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useSearchStore } from "@/store/searchStore";

interface SearchProductGridProps {
  products: Array<{
    _id: string;
    title?: string;
    shopifyHandle?: string;
    mainImage?: any;
    shortDescription?: string;
    category?: {
      title: string;
      slug: any;
    };
    brand?: {
      name: string;
      slug: any;
    };
  }>;
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
            key={product._id}
            href={`/products/${product.shopifyHandle}`}
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
