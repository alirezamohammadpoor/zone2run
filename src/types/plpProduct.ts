/**
 * Minimal product type for Product Listing Pages (PLPs).
 * Contains only the fields needed for rendering + filtering.
 * Reduces payload size compared to full SanityProduct.
 */
export interface PLPProduct {
  _id: string;
  title: string;
  handle: string;
  /** Required by ProductCard - usually same as brand name */
  vendor: string;
  images: Array<{
    url: string;
    alt: string;
    lqip?: string;
  }>;
  priceRange: {
    minVariantPrice: number;
    maxVariantPrice?: number;
  };
  /** Flattened array of available sizes from variants */
  sizes: string[];
  brand: {
    name: string;
    slug: string;
  };
  category: {
    title: string;
    slug: string;
  };
  /** Used for gender filtering */
  gender?: string;
  /** Used for "newest" sorting */
  _createdAt?: string;
}
