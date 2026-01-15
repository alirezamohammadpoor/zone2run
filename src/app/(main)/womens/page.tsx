import { getProductsByGender } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function WomensPage() {
  const products = await getProductsByGender("women");

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div>
      <ProductGrid products={products} />
    </div>
  );
}
