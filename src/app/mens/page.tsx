import { getProductsByGender } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

export default async function MensPage() {
  const products = await getProductsByGender("men");

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Men's Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
