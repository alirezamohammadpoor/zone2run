import { getRelatedProducts } from "@/sanity/lib/getData";
import RelatedProducts from "./RelatedProducts";

interface RelatedProductsServerProps {
  brandSlug: string;
  currentProductId?: string;
  displayType?: "grid" | "carousel";
  limit?: number;
  country?: string;
}

export default async function RelatedProductsServer({
  brandSlug,
  currentProductId,
  displayType = "carousel",
  limit,
  country,
}: RelatedProductsServerProps) {
  const products = await getRelatedProducts(
    brandSlug,
    currentProductId ?? "",
    limit,
    country,
  );

  if (!products || products.length === 0) {
    return null;
  }

  // Deterministic rotation seeded by product id — order varies across PDPs but
  // is stable per page, so the result is cacheable (Math.random() is sync-IO
  // under Cache Components and would block prerendering)
  const rotated = [...products];
  if (currentProductId && rotated.length > 1) {
    let seed = 0;
    for (const ch of currentProductId) seed = (seed * 31 + ch.charCodeAt(0)) % 997;
    rotated.push(...rotated.splice(0, seed % rotated.length));
  }

  // Get brand name from first product
  const brandName = rotated[0]?.brand?.name || "This Brand";

  return (
    <RelatedProducts
      products={rotated}
      brandName={brandName}
      brandSlug={brandSlug}
      displayType={displayType}
    />
  );
}
