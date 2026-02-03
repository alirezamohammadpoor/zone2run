import type { SanityProduct } from "@/types/sanityProduct";
import type { ShopifyProduct } from "@/types/shopify";
import type { ProductSchema, AggregateOfferSchema, AvailabilityType } from "./types";

interface ProductJsonLdProps {
  product: SanityProduct;
  shopifyProduct?: ShopifyProduct | null;
  locale: string;
}

/**
 * Generates JSON-LD structured data for product pages.
 * When shopifyProduct is provided, uses Shopify's locale-aware prices
 * (fetched via @inContext) so structured data matches the displayed currency.
 */
export default function ProductJsonLd({ product, shopifyProduct, locale }: ProductJsonLdProps) {
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

  // Use Shopify locale-aware availability when available, fall back to Sanity
  const anyVariantAvailable = shopifyProduct
    ? shopifyProduct.availableForSale
    : (product.variants?.some((v) => v.available) ?? false);
  const availability: AvailabilityType = anyVariantAvailable
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  // Use Shopify locale prices when available (matches displayed currency),
  // fall back to Sanity prices (SEK)
  const lowPrice = shopifyProduct?.priceRange.minVariantPrice.amount
    ?? product.priceRange.minVariantPrice;
  const highPrice = shopifyProduct?.priceRange.maxVariantPrice.amount
    ?? product.priceRange.maxVariantPrice;
  const priceCurrency = shopifyProduct?.priceRange.minVariantPrice.currencyCode
    ?? product.priceRange.currencyCode
    ?? "SEK";

  // Build offers - use AggregateOffer for price range
  const offers: AggregateOfferSchema = {
    "@type": "AggregateOffer",
    lowPrice,
    highPrice,
    priceCurrency,
    availability,
    offerCount: shopifyProduct?.variants.length ?? product.variants?.length ?? 1,
    url: `${baseUrl}/${locale}/products/${product.handle}`,
  };

  // Build the complete schema
  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: cleanDescription,
    image: images.length > 0 ? images : undefined,
    sku: product.variants?.[0]?.sku,
    gtin: product.variants?.[0]?.barcode || product.variants?.[0]?.sku,
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
