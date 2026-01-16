import ProductCard from "./ProductCard";
import type { SanityProduct } from "@/types/sanityProduct";

interface ProductGridProps {
  products: Array<SanityProduct>;
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 px-2 my-8 md:my-12 xl:my-16">
      {products?.map((product) => {
        return (
          <article key={`${product._id}-${product.handle}`}>
            <ProductCard product={product} />
          </article>
        );
      })}
    </div>
  );
}
