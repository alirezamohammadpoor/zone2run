import { getProductsByPath } from "@/sanity/lib/getData";
import ProductGrid from "@/components/ProductGrid";

export default async function UnisexSubcategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string; subcategory: string }>;
}) {
  const { mainCategory, subcategory } = await params;

  const products = await getProductsByPath(
    "unisex",
    "subcategory",
    subcategory
  );

  const title = `${
    mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)
  } - ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Unisex {title}</h1>
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
        <>
          <p className="text-sm text-gray-600 mb-4">
            Found {products.length} products
          </p>
          <ProductGrid products={products} />
        </>
      )}
    </div>
  );
}
