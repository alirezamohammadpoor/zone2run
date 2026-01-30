import type { Metadata } from "next";
import { getProductsByPath } from "@/sanity/lib/getData";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/plp/ProductListing";
import { buildCategoryBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { buildCategoryMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}): Promise<Metadata> {
  const { mainCategory } = await params;
  return buildCategoryMetadata("mens", mainCategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function MensCategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}) {
  const { mainCategory } = await params;

  // Fetch both category approaches in parallel to avoid waterfall
  const [mainProducts, subProducts] = await Promise.all([
    getProductsByPath("men", "main", mainCategory),
    getProductsByPath("men", "subcategory", mainCategory),
  ]);

  // Use main category results if available, otherwise fall back to subcategory
  const products = mainProducts?.length ? mainProducts : subProducts;

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div>
      <ProductListing
        products={products}
        breadcrumbs={buildCategoryBreadcrumbs("mens", [mainCategory])}
      />
    </div>
  );
}
