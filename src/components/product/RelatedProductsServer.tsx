import { getRelatedProducts } from "@/sanity/lib/getData";
import RelatedProducts from "./RelatedProducts";

interface RelatedProductsServerProps {
  brandSlug: string;
  currentProductId?: string;
  displayType?: "grid" | "carousel";
  limit?: number;
}

export default async function RelatedProductsServer({
  brandSlug,
  currentProductId,
  displayType = "carousel",
  limit = 12,
}: RelatedProductsServerProps) {
  // Fetch with lightweight projection and limit - excludes current product in query
  const products = await getRelatedProducts(brandSlug, currentProductId, limit);

  if (!products || products.length === 0) {
    return null;
  }

  // Get brand name from first product
  const brandName = products[0]?.brand?.name || "This Brand";

  return (
    <RelatedProducts
      products={products}
      brandName={brandName}
      brandSlug={brandSlug}
      displayType={displayType}
    />
  );
}
