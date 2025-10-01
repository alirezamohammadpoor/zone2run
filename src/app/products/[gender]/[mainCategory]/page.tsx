import { getProductsByPath } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

export default async function MainCategoryPage({
  params,
}: {
  params: Promise<{ gender: string; mainCategory: string }>;
}) {
  const { gender, mainCategory } = await params;

  // Format gender for display
  const formattedGender =
    gender === "women"
      ? "Women's"
      : gender === "men"
      ? "Men's"
      : gender === "unisex"
      ? "Unisex"
      : gender === "kids"
      ? "Kids"
      : gender;

  console.log(
    `Debug: Fetching products for gender: ${gender}, mainCategory: ${mainCategory}`
  );

  const products = await getProductsByPath(gender, "main", mainCategory);

  // Debug: Check what genders are in the results
  console.log(
    `Debug: Found ${
      products?.length || 0
    } products for ${gender}/${mainCategory}`
  );

  if (products && products.length > 0) {
    const genders = products.map((p) => p.sanity.gender).filter(Boolean);
    const uniqueGenders = [...new Set(genders)];
  }

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {formattedGender}{" "}
        {mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)}
      </h1>
      <ProductGrid products={products} />
    </div>
  );
}
