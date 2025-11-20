import { getProductsByPath3Level } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

export default async function WomensSpecificCategoryPage({
  params,
}: {
  params: Promise<{
    mainCategory: string;
    subcategory: string;
    specificCategory: string;
  }>;
}) {
  const { mainCategory, subcategory, specificCategory } = await params;

  const products = await getProductsByPath3Level(
    "women",
    mainCategory,
    subcategory,
    specificCategory
  );

  if (!products || products.length === 0) {
    notFound();
  }

  const mainCategoryTitle =
    mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);
  const subcategoryTitle =
    subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
  const specificCategoryTitle =
    specificCategory.charAt(0).toUpperCase() + specificCategory.slice(1);

  return (
    <div>
      <ProductGrid products={products} />
    </div>
  );
}
