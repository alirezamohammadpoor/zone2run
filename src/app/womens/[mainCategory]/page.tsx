import { getProductsByPath } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

// ISR: Revalidate every 5 minutes, on-demand via Sanity webhook
export const revalidate = 300;

export default async function WomensCategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}) {
  const { mainCategory } = await params;

  const products = await getProductsByPath("women", "main", mainCategory);

  if (!products || products.length === 0) {
    notFound();
  }

  const categoryTitle =
    mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);

  return (
    <div>
      <ProductGrid products={products} />
    </div>
  );
}
