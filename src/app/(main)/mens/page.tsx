import { getProductsByGender } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function MensPage() {
  const products = await getProductsByGender("men");

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div>
      <ProductGrid products={products} />
    </div>
  );
}
