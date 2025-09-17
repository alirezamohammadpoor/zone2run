import { getProductsByPath } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

export default async function WomensCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const products = await getProductsByPath("women", "main", category);

  if (!products || products.length === 0) {
    notFound();
  }

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Women's {categoryTitle}</h1>
      <ProductGrid products={products} />
    </div>
  );
}
