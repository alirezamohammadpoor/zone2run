import { getProductsBySubcategoryIncludingSubSubcategories } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function WomensSubcategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string; subcategory: string }>;
}) {
  const { mainCategory, subcategory } = await params;

  const products = await getProductsBySubcategoryIncludingSubSubcategories(
    "women",
    mainCategory,
    subcategory
  );

  if (!products || products.length === 0) {
    notFound();
  }

  const categoryTitle =
    mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);
  const subcategoryTitle =
    subcategory.charAt(0).toUpperCase() + subcategory.slice(1);

  return (
    <div>
      <ProductGrid products={products} />
    </div>
  );
}
