// lib/shopify/products.ts
import shopifyClient from "@/lib/client";
import type { ShopifyProduct } from "@/types/shopify";

// Shopify GraphQL Response Types
interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

interface ShopifySelectedOption {
  name: string;
  value: string;
}

interface ShopifyVariantNode {
  id: string;
  title: string;
  sku: string | null;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions: ShopifySelectedOption[];
  image: ShopifyImage | null;
}

interface ShopifyCollectionNode {
  id: string;
  title: string;
  handle: string;
}

interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  featuredImage: ShopifyImage | null;
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariantNode }> };
  options: Array<{ name: string; values: string[] }>;
  seo: { title: string | null; description: string | null } | null;
  collections?: { edges: Array<{ node: ShopifyCollectionNode }> };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface ProductByHandleResponse {
  productByHandle: ShopifyProductNode | null;
}

interface AllProductHandlesResponse {
  products: { edges: Array<{ node: { handle: string; title: string } }> };
}

// GraphQL queries
export const GET_PRODUCT_BY_HANDLE = `
  query getProductByHandle($handle: String!, $country: CountryCode)
  @inContext(country: $country) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      vendor
      productType
      availableForSale
      
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      
      featuredImage {
        url 
        altText
        width
        height
      }
      
      images(first: 20) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      
      variants(first: 100) {
        edges {
          node {
            id
            title
            sku
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
          }
        }
      }
      
      options {
        name
        values
      }
      
      seo {
        title
        description
      }
      
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      
      tags
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const GET_ALL_PRODUCT_HANDLES = `
  query getAllProductHandles {
    products(first: 250) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

// Transform function
const transformShopifyProduct = (product: ShopifyProductNode): ShopifyProduct => ({
  id: product.id,
  title: product.title,
  handle: product.handle,
  description: product.description,
  vendor: product.vendor,
  productType: product.productType,

  availableForSale: product.availableForSale,

  priceRange: {
    minVariantPrice: {
      amount: parseFloat(product.priceRange.minVariantPrice.amount),
      currencyCode: product.priceRange.minVariantPrice.currencyCode,
    },
    maxVariantPrice: {
      amount: parseFloat(product.priceRange.maxVariantPrice.amount),
      currencyCode: product.priceRange.maxVariantPrice.currencyCode,
    },
  },

  featuredImage: product.featuredImage
    ? {
        url: product.featuredImage.url,
        altText: product.featuredImage.altText ?? undefined,
        width: product.featuredImage.width ?? 0,
        height: product.featuredImage.height ?? 0,
      }
    : undefined,

  images: product.images.edges.map(({ node }) => ({
    url: node.url,
    altText: node.altText ?? undefined,
    width: node.width ?? 0,
    height: node.height ?? 0,
  })),

  variants: product.variants.edges.map(({ node }) => {
    const optionsMap = Object.fromEntries(
      node.selectedOptions.map((opt) => [opt.name, opt.value])
    );

    return {
      id: node.id,
      title: node.title,
      sku: node.sku ?? "",
      price: {
        amount: parseFloat(node.price.amount),
        currencyCode: node.price.currencyCode,
      },
      compareAtPrice: node.compareAtPrice
        ? {
            amount: parseFloat(node.compareAtPrice.amount),
            currencyCode: node.compareAtPrice.currencyCode,
          }
        : undefined,
      availableForSale: node.availableForSale,
      quantityAvailable: node.quantityAvailable,
      selectedOptions: node.selectedOptions,
      image: node.image
        ? {
            url: node.image.url,
            altText: node.image.altText ?? undefined,
          }
        : undefined,

      // Convenience fields
      size: optionsMap.Size,
      color: optionsMap.Color,
      material: optionsMap.Material,
    };
  }),

  options: product.options.map((option) => ({
    name: option.name,
    values: option.values,
  })),

  seo: product.seo
    ? {
        title: product.seo.title ?? "",
        description: product.seo.description ?? "",
      }
    : undefined,

  collections:
    product.collections?.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
    })) || [],

  tags: product.tags,

  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  publishedAt: product.publishedAt,
});

// Main functions
export async function getShopifyProductByHandle(
  handle: string,
  country?: string,
): Promise<ShopifyProduct | null> {
  const start = performance.now();
  try {
    // no-store: PDP variant availability must be fresh (no OOS items in cart)
    const { productByHandle } = (await shopifyClient.request(
      GET_PRODUCT_BY_HANDLE,
      { handle, country: country || undefined },
      { cache: "no-store" },
    )) as ProductByHandleResponse;
    const duration = performance.now() - start;
    console.log(`⚡ Shopify fetch [${handle}]: ${duration.toFixed(0)}ms`);
    return productByHandle ? transformShopifyProduct(productByHandle) : null;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`❌ Shopify fetch failed [${handle}]: ${duration.toFixed(0)}ms`, error);
    return null;
  }
}

export async function getAllShopifyHandles(): Promise<string[]> {
  try {
    const response = (await shopifyClient.request(
      GET_ALL_PRODUCT_HANDLES,
      undefined,
      { next: { revalidate: 3600 } },
    )) as AllProductHandlesResponse;
    const handles = response.products.edges.map(({ node }) => node.handle);
    console.log("🛍️ Available Shopify handles:", handles);
    return handles;
  } catch (error) {
    console.error("Error fetching Shopify handles:", error);
    return [];
  }
}
