/**
 * Minimal product shape for display-only contexts.
 * Used by ProductCard, ProductGrid, and ProductCarousel.
 */
export interface CardProduct {
  _id: string;
  handle: string;
  title: string;
  vendor: string;
  priceRange: { minVariantPrice: number };
  images?: Array<{ url: string; alt?: string; lqip?: string }>;
  brand?: { name?: string; slug?: string };
  sizes?: string[];
}
