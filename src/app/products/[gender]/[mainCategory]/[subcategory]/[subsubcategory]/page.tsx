import ProductGrid from "@/components/ProductGrid";
import { getProductsByPath3Level } from "@/sanity/lib/getData";

export default async function SubSubCategoryPage({
  params,
}: {
  params: Promise<{
    gender: string;
    mainCategory: string;
    subcategory: string;
    subsubcategory: string;
  }>;
}) {
  const { gender, mainCategory, subcategory, subsubcategory } = await params;

  console.log(
    `Debug: Fetching products for 3rd level: ${gender}/${mainCategory}/${subcategory}/${subsubcategory}`
  );

  const products = await getProductsByPath3Level(
    gender,
    mainCategory,
    subcategory,
    subsubcategory
  );

  console.log(
    `Debug: Found ${products?.length || 0} products for ${subsubcategory}`
  );

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6 mt-10 ml-2">
        {gender} / {mainCategory} / {subcategory} / {subsubcategory}
      </h1>
      <p className="text-sm ml-2 mb-4">
        Found {products?.length || 0} products
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
