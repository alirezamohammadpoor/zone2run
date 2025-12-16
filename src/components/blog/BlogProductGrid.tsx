import ProductCard from "@/components/ProductCard";
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
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
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
