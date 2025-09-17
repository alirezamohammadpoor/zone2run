import ProductGrid from "@/components/ProductGrid";
import { getProductsBySubcategoryIncludingSubSubcategories } from "@/sanity/lib/getData";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{
    gender: string;
    mainCategory: string;
    subcategory: string;
  }>;
}) {
  const { gender, mainCategory, subcategory } = await params;

  const products = await getProductsBySubcategoryIncludingSubSubcategories(
    gender,
    mainCategory,
    subcategory
  );

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6 mt-10 ml-2">
        {gender} / {mainCategory} / {subcategory}
      </h1>
      <p className="text-sm ml-2 mb-4">
        Found {products?.length || 0} products
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
