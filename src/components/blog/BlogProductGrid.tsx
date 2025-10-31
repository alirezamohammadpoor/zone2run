import React from "react";
import Link from "next/link";
import BlogProductCard from "./BlogProductCard";
import type { SanityProduct } from "@/types/sanityProduct";

interface BlogProductGridProps {
  products: Array<
    SanityProduct & { selectedImage?: { url: string; alt: string } }
  >;
  count?: number;
}

export default function BlogProductGrid({
  products,
  count,
}: BlogProductGridProps) {
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
            <BlogProductCard product={product} />
          </Link>
        );
      })}
    </div>
  );
}
