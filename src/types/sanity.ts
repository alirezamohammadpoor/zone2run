export interface SanityProduct {
  _id: string;
  title?: string;
  displayTitle?: string;
  originalTitle?: string;
  shopifyId?: string;
  shopifyHandle?: string;
  shortDescription?: string;
  gender?: string;
  // Images
  mainImage?: {
    asset?: {
      url: string;
      metadata?: any;
    };
    alt?: string;
  };
  gallery?: Array<{
    asset?: {
      url: string;
      metadata?: any;
    };
    alt?: string;
  }>;

  // Rich content
  description?: any[];
  productDetails?: Array<{
    title?: string;
    value?: string;
  }>;
  careInstructions?: string[];

  // Taxonomy
  category?: {
    _id: string;
    title?: string;
    slug?: {
      current?: string;
    };
    categoryType?: string;
    parentCategory?: {
      _id: string;
      title?: string;
      slug?: {
        current?: string;
      };
    };
  };
  brand?: {
    _id: string;
    name?: string;
    logo?: {
      asset?: {
        url: string;
      };
    };
  };

  // Meta
  featured?: boolean;
  tags?: string[];
}
