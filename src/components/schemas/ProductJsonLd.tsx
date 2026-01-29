import type { SanityProduct } from "@/types/sanityProduct";
import type { ProductSchema, AggregateOfferSchema, AvailabilityType } from "./types";

interface ProductJsonLdProps {
  product: SanityProduct;
}

/**
 * Generates JSON-LD structured data for product pages.
 * This helps Google display rich snippets with price, availability, and ratings.
 */
export default function ProductJsonLd({ product }: ProductJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";

  // Strip HTML tags from description
  const cleanDescription = product.description
    ?.replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 5000); // Schema.org recommends max 5000 chars

  // Collect all product images (images[0] = main, rest = gallery)
  const images: string[] = product.images
    ?.map((img) => img.url)
    .filter(Boolean) || [];

  // Check if any variant is available
  const anyVariantAvailable = product.variants?.some((v) => v.available) ?? false;
  const availability: AvailabilityType = anyVariantAvailable
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  // Build offers - use AggregateOffer for price range
  const offers: AggregateOfferSchema = {
    "@type": "AggregateOffer",
    lowPrice: product.priceRange.minVariantPrice,
    highPrice: product.priceRange.maxVariantPrice,
    priceCurrency: product.priceRange.currencyCode || "SEK",
    availability,
    offerCount: product.variants?.length || 1,
    url: `${baseUrl}/products/${product.handle}`,
  };

  // Build the complete schema
  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: cleanDescription,
    image: images.length > 0 ? images : undefined,
    sku: product.variants?.[0]?.sku,
    offers,
  };

  // Add brand if available
  if (product.brand?.name) {
    schema.brand = {
      "@type": "Brand",
      name: product.brand.name,
    };
  }

  return (
    <script
      id="product-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
