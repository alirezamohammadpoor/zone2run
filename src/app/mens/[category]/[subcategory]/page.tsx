import { getProductsByPath } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

export default async function MensSubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category, subcategory } = await params;

  const products = await getProductsByPath("men", "sub", subcategory);

  if (!products || products.length === 0) {
    notFound();
  }

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const subcategoryTitle =
    subcategory.charAt(0).toUpperCase() + subcategory.slice(1);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Men's {categoryTitle} - {subcategoryTitle}
      </h1>
      <ProductGrid products={products} />
    </div>
  );
}
