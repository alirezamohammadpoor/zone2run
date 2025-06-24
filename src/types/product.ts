export interface SanityProduct {
  _id: string;
  title?: string;
  shopifyId?: string;
  shopifyHandle?: string;
  shortDescription?: string;
  mainImage?: {
    asset?: {
      url: string;
      metadata?: any;
    };
    alt?: string;
  };
  category?: {
    _id: string;
    title?: string;
    slug?: {
      current?: string;
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
  featured?: boolean;
  tags?: string[];
}

export interface SanityProductDetail extends SanityProduct {
  description?: any[];
  gallery?: Array<{
    asset?: {
      url: string;
      metadata?: any;
    };
    alt?: string;
  }>;
  productDetails?: Array<{
    title?: string;
    value?: string;
  }>;
  careInstructions?: string[];
}
