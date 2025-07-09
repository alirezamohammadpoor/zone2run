import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Array<Product>;
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mx-2">
      {products?.map((product) => {
        return (
          <Link
            key={product.shopify.handle}
            href={`/products/${product.shopify.handle}`}
            className="hover:cursor-pointer"
          >
            <ProductCard product={product} />
          </Link>
        );
      })}
    </div>
  );
}
