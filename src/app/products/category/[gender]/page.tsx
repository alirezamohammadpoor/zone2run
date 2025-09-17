import { getProductsByGender } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

export default async function GenderPage({
  params,
}: {
  params: Promise<{ gender: string }>;
}) {
  const { gender } = await params;

  // Format gender for display
  const formattedGender =
    gender === "women"
      ? "Women's"
      : gender === "men"
      ? "Men's"
      : gender === "unisex"
      ? "Unisex"
      : gender === "kids"
      ? "Kids"
      : gender;

  const products = await getProductsByGender(gender);

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{formattedGender} Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
