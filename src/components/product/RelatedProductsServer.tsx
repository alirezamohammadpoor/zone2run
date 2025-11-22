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

  // Limit products if specified
  const displayProducts = limit
    ? filteredProducts.slice(0, limit)
    : filteredProducts;

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
