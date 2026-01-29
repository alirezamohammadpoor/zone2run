import { getProductsByBrand } from "@/sanity/lib/getData";
import RelatedProducts from "./RelatedProducts";
import type { SanityProduct } from "@/types/sanityProduct";

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
  limit,
}: RelatedProductsServerProps) {
  const products = await getProductsByBrand(brandSlug);

  if (!products || products.length === 0) {
    return null;
  }

  // Filter out current product if provided
  const filteredProducts = currentProductId
    ? products.filter((product) => product._id !== currentProductId)
    : products;

  // Shuffle so the carousel feels fresh on every visit (Fisher-Yates)
  const shuffled = [...filteredProducts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Limit products if specified
  const displayProducts = limit
    ? shuffled.slice(0, limit)
    : shuffled;

  if (displayProducts.length === 0) {
    return null;
  }

  // Get brand name from first product
  const brandName = displayProducts[0]?.brand?.name || "This Brand";

  return (
    <RelatedProducts
      products={displayProducts}
      brandName={brandName}
      brandSlug={brandSlug}
      displayType={displayType}
    />
  );
}
