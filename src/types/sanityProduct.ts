// src/types/sanity-product.ts
export interface SanityProduct {
  // Core product data
  _id: string;
  _createdAt?: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];

  // Pricing
  priceRange: {
    minVariantPrice: number;
    maxVariantPrice: number;
    currencyCode: string;
  };

  // Images
  mainImage: {
    url: string;
    alt: string;
    lqip?: string;
  };
  gallery?: Array<{
    url: string;
    alt?: string;
  }>;

  // Options & Variants
  options: Array<{
    name: string;
    values: string[];
  }>;
  variants: Array<{
    id: string;
    title: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    available: boolean;
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
  }>;

  // Sanity-specific data
  category: {
    _id: string;
    title: string;
    slug: string;
    categoryType: string;
    parentCategory?: {
      _id: string;
      title: string;
      slug: string;
      categoryType: string;
      parentCategory?: {
        _id: string;
        title: string;
        slug: string;
      };
    };
  };
  brand: {
    _id: string;
    name: string;
    description?: string;
    slug?: string;
    logo?: {
      url: string;
    };
  };
  gender: string;
  featured: boolean;
  colorVariants?: Array<{
    _id: string;
    title: string;
    handle: string;
    mainImage: {
      url: string;
      alt: string;
    };
  }>;
  editorialImages?: Array<{
    _key: string;
    image: {
      asset: {
        _id: string;
        url: string;
      };
      alt?: string;
    };
    caption?: string;
  }>;
}
