export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  availableForSale: boolean;
  totalInventory?: number;

  priceRange: {
    minVariantPrice: {
      amount: number;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: number;
      currencyCode: string;
    };
  };

  featuredImage?: {
    url: string;
    altText?: string;
    width: number;
    height: number;
  };

  images: Array<{
    url: string;
    altText?: string;
    width: number;
    height: number;
  }>;

  variants: Array<{
    id: string;
    title: string;
    sku: string;
    price: {
      amount: number;
      currencyCode: string;
    };
    compareAtPrice?: {
      amount: number;
      currencyCode: string;
    };
    availableForSale: boolean;
    quantityAvailable?: number;
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
    image?: {
      url: string;
      altText?: string;
    };
    size?: string;
    color?: string;
    material?: string;
  }>;

  options: Array<{
    name: string;
    values: string[];
  }>;

  seo?: {
    title: string;
    description: string;
  };

  collections: Array<{
    id: string;
    title: string;
    handle: string;
  }>;

  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;

  metafields?: Array<{
    key: string;
    value: string;
    type: string;
  }>;
}
