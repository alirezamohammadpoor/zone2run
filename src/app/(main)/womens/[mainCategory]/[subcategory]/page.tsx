import type { Metadata } from "next";
import { getProductsBySubcategoryIncludingSubSubcategories } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/plp/ProductListing";
import { buildCategoryBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { buildCategoryMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mainCategory: string; subcategory: string }>;
}): Promise<Metadata> {
  const { mainCategory, subcategory } = await params;
  return buildCategoryMetadata("womens", mainCategory, subcategory);
}

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

  return (
    <div>
      <ProductListing
        products={products}
        breadcrumbs={buildCategoryBreadcrumbs("womens", [mainCategory, subcategory])}
      />
    </div>
  );
}
