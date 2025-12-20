import { getProductsByPath } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

export default async function MensCategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}) {
  const { mainCategory } = await params;

  // Try to get products with a more flexible approach
  let products = await getProductsByPath("men", "main", mainCategory);

  // If no products found with main category approach, try subcategory approach
  if (!products || products.length === 0) {
    products = await getProductsByPath("men", "subcategory", mainCategory);
  }

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div>
      <ProductGrid products={products} />
    </div>
  );
}
