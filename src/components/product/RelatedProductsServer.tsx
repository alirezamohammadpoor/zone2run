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

  // Shuffle so the carousel feels fresh on every visit (Fisher-Yates)
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Get brand name from first product
  const brandName = shuffled[0]?.brand?.name || "This Brand";

  return (
    <RelatedProducts
      products={shuffled}
      brandName={brandName}
      brandSlug={brandSlug}
      displayType={displayType}
    />
  );
}
