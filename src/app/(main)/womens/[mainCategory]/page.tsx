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
  return buildCategoryMetadata("womens", mainCategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function WomensCategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}) {
  const { mainCategory } = await params;

  const products = await getProductsByPath("women", "main", mainCategory);

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div>
      <ProductListing
        products={products}
        breadcrumbs={buildCategoryBreadcrumbs("womens", [mainCategory])}
      />
    </div>
  );
}
