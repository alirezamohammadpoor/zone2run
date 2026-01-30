/**
 * Minimal product shape for display-only contexts.
 * Used by ProductCard, ProductGrid, and ProductCarousel.
 *
 * Supports both nested brand (brand.name) and
 * flattened brand fields (brandName) via dual fields.
 */
export interface CardProduct {
  _id: string;
  handle: string;
  title: string;
  vendor: string;
  priceRange: { minVariantPrice: number };
  images?: Array<{ url: string; alt?: string; lqip?: string }>;
  brand?: { name?: string; slug?: string };
  brandName?: string | null;
  brandSlug?: string | null;
  sizes?: string[];
}
