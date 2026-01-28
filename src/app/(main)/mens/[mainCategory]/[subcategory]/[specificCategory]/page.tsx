import type { Metadata } from "next";
import { getProductsBySubcategoryIncludingSubSubcategories } from "@/sanity/lib/getData";
import { mapToMinimalProducts } from "@/lib/mapToMinimalProduct";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/plp/ProductListing";
import { buildCategoryBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { buildCategoryMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    mainCategory: string;
    subcategory: string;
    specificCategory: string;
  }>;
}): Promise<Metadata> {
  const { mainCategory, subcategory, specificCategory } = await params;
  return buildCategoryMetadata("mens", mainCategory, subcategory, specificCategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function MensSpecificCategoryPage({
  params,
}: {
  params: Promise<{
    mainCategory: string;
    subcategory: string;
    specificCategory: string;
  }>;
}) {
  const { mainCategory, subcategory, specificCategory } = await params;

  // Fetch all products under the parent subcategory so sibling categories
  // appear in the filter modal. The specific category is pre-applied via initialFilters.
  const products = await getProductsBySubcategoryIncludingSubSubcategories(
    "men",
    mainCategory,
    subcategory
  );

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div>
      <ProductListing
        products={mapToMinimalProducts(products)}
        breadcrumbs={buildCategoryBreadcrumbs("mens", [mainCategory, subcategory, specificCategory])}
        initialFilters={{ category: [specificCategory] }}
      />
    </div>
  );
}
