import { getProductsByPath } from "@/sanity/lib/getData";
import ProductGrid from "@/components/ProductGrid";

export default async function UnisexMainCategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}) {
  const { mainCategory } = await params;

  // Try main category under unisex, then fall back to subcategory
  let products = await getProductsByPath("unisex", "main", mainCategory);
  if (!products || products.length === 0) {
    products = await getProductsByPath("unisex", "subcategory", mainCategory);
  }

  const categoryTitle =
    mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);

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
