import type { CardProduct } from "./cardProduct";

/**
 * Product type for Product Listing Pages (PLPs).
 * Extends CardProduct with filtering/sorting fields.
 *
 * Matches PLP_PRODUCT_PROJECTION in groqUtils.ts —
 * GROQ returns this shape directly (no mapToMinimalProduct needed).
 */
export interface PLPProduct extends CardProduct {
  /** Stricter than CardProduct — PLP always has images with alt text */
  images: Array<{ url: string; alt: string; lqip?: string }>;
  priceRange: { minVariantPrice: number; maxVariantPrice?: number; currencyCode?: string };
  /** Flattened array of available sizes (computed from variant option1) */
  sizes: string[];
  /** Required for PLP — brand always resolved */
  brand: { name: string; slug: string };
  category: { title: string; slug: string };
  /** Used for gender filtering */
  gender?: string;
  /** Used for "newest" sorting */
  _createdAt?: string;
}
