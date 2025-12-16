import Link from "next/link";
import ProductCard from "./ProductCard";
import type { SanityProduct } from "@/types/sanityProduct";

interface ProductGridProps {
  products: Array<SanityProduct>;
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 mx-2">
      {products?.map((product) => {
        return (
          <Link
            key={`${product._id}-${product.handle}`}
            href={`/products/${product.handle}`}
            className="hover:cursor-pointer"
          >
            <ProductCard product={product} />
          </Link>
        );
      })}
    </div>
  );
}
