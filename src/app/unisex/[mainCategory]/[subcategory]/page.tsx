import { getProductsBySubcategoryIncludingSubSubcategories } from "@/sanity/lib/getData";
import ProductGrid from "@/components/ProductGrid";

export default async function UnisexSubcategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string; subcategory: string }>;
}) {
  const { mainCategory, subcategory } = await params;

  const products = await getProductsBySubcategoryIncludingSubSubcategories(
    "unisex",
    mainCategory,
    subcategory
  );

  const title = `${
    mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)
  } - ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`;

  return (
    <div>
      {!products || products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            No products found in this category.
          </p>
          <p className="text-sm text-gray-500">
            Products may be added to this category soon.
          </p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
