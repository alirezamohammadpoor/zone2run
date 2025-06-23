import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

interface ProductGridProps {
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

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2">
      {products?.map((product) => {
        return (
          <Link
            key={product._id}
            href={`/products/${product.shopifyHandle}`}
            className="hover:cursor-pointer"
          >
            <ProductCard product={product} />
          </Link>
        );
      })}
    </div>
  );
}
