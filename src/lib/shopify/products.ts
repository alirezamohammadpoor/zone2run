// lib/shopify/products.ts
import shopifyClient from "@/lib/client";
import type { ShopifyProduct } from "@/types/shopify";

// GraphQL queries
export const GET_PRODUCT_BY_HANDLE = `
  query getProductByHandle($handle: String!) {
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

export const GET_PRODUCTS_BY_COLLECTION = `
  query getProductsByCollection($handle: String!, $first: Int!) {
    collectionByHandle(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
            tags
          }
        }
      }
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
const transformShopifyProduct = (product: any): ShopifyProduct => ({
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
        altText: product.featuredImage.altText,
        width: product.featuredImage.width,
        height: product.featuredImage.height,
      }
    : undefined,

  images: product.images.edges.map(({ node }: any) => ({
    url: node.url,
    altText: node.altText,
    width: node.width,
    height: node.height,
  })),

  variants: product.variants.edges.map(({ node }: any) => {
    const optionsMap = Object.fromEntries(
      node.selectedOptions.map((opt: any) => [opt.name, opt.value])
    );

    return {
      id: node.id,
      title: node.title,
      sku: node.sku,
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
            altText: node.image.altText,
          }
        : undefined,

      // Convenience fields
      size: optionsMap.Size,
      color: optionsMap.Color,
      material: optionsMap.Material,
    };
  }),

  options: product.options.map((option: any) => ({
    name: option.name,
    values: option.values,
  })),

  seo: product.seo
    ? {
        title: product.seo.title,
        description: product.seo.description,
      }
    : undefined,

  collections:
    product.collections?.edges.map(({ node }: any) => ({
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
  handle: string
): Promise<ShopifyProduct | null> {
  try {
    const { productByHandle } = (await shopifyClient.request(
      GET_PRODUCT_BY_HANDLE,
      { handle }
    )) as any;
    return productByHandle ? transformShopifyProduct(productByHandle) : null;
  } catch (error) {
    console.error("Error fetching Shopify product:", error);
    return null;
  }
}

export async function getShopifyProductsByCollection(
  collectionHandle: string,
  first: number = 20
): Promise<ShopifyProduct[]> {
  try {
    const response = (await shopifyClient.request(GET_PRODUCTS_BY_COLLECTION, {
      handle: collectionHandle,
      first,
    })) as any;

    const products = response.collectionByHandle?.products?.edges || [];
    return products.map(({ node }: any) => transformShopifyProduct(node));
  } catch (error) {
    console.error("Error fetching Shopify products by collection:", error);
    return [];
  }
}

export async function getAllShopifyHandles(): Promise<string[]> {
  try {
    const response = (await shopifyClient.request(
      GET_ALL_PRODUCT_HANDLES
    )) as any;
    const handles = response.products.edges.map(({ node }: any) => node.handle);
    console.log("🛍️ Available Shopify handles:", handles);
    return handles;
  } catch (error) {
    console.error("Error fetching Shopify handles:", error);
    return [];
  }
}
