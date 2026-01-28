import { getProductsByGender } from "@/sanity/lib/getData";
import { mapToMinimalProducts } from "@/lib/mapToMinimalProduct";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/plp/ProductListing";
import { buildCategoryBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { buildCategoryMetadata } from "@/lib/metadata";

export const metadata = buildCategoryMetadata("womens");

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function WomensPage() {
  const products = await getProductsByGender("women");

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div>
      <ProductListing
        products={mapToMinimalProducts(products)}
        breadcrumbs={buildCategoryBreadcrumbs("womens")}
      />
    </div>
  );
}
