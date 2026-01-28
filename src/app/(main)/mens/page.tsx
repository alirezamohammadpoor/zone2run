import { getProductsByGender } from "@/sanity/lib/getData";
import { mapToMinimalProducts } from "@/lib/mapToMinimalProduct";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/plp/ProductListing";
import { buildCategoryBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { buildCategoryMetadata } from "@/lib/metadata";

export const metadata = buildCategoryMetadata("mens");

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function MensPage() {
  const products = await getProductsByGender("men");

  if (!products || products.length === 0) {
    notFound();
  }

  return (
    <div>
      <ProductListing
        products={mapToMinimalProducts(products)}
        breadcrumbs={buildCategoryBreadcrumbs("mens")}
      />
    </div>
  );
}
