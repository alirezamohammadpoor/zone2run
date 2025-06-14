import shopifyClient from "../shopify";
import { GET_PRODUCTS, GET_PRODUCT_BY_HANDLE } from "./queries";

export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image: {
    url: string;
    altText: string | null;
  };
  variants: Array<{
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    compareAtPrice?: {
      amount: string;
      currencyCode: string;
    };
  }>;
}

export async function getProducts(
  first: number = 10
): Promise<ShopifyProduct[]> {
  try {
    const response = await shopifyClient.request(GET_PRODUCTS, { first });

    return response.products.edges.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      description: node.description,
      handle: node.handle,
      price: {
        amount: node.priceRange.minVariantPrice.amount,
        currencyCode: node.priceRange.minVariantPrice.currencyCode,
      },
      image: {
        url: node.images.edges[0]?.node.url || "",
        altText: node.images.edges[0]?.node.altText,
      },
      variants: node.variants.edges.map(({ node: variant }: any) => ({
        id: variant.id,
        title: variant.title,
        price: {
          amount: variant.price.amount,
          currencyCode: variant.price.currencyCode,
        },
        compareAtPrice: variant.compareAtPrice
          ? {
              amount: variant.compareAtPrice.amount,
              currencyCode: variant.compareAtPrice.currencyCode,
            }
          : undefined,
      })),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  try {
    const response = await shopifyClient.request(GET_PRODUCT_BY_HANDLE, {
      handle,
    });
    const product = response.productByHandle;

    if (!product) return null;

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      price: {
        amount: product.priceRange.minVariantPrice.amount,
        currencyCode: product.priceRange.minVariantPrice.currencyCode,
      },
      image: {
        url: product.images.edges[0]?.node.url || "",
        altText: product.images.edges[0]?.node.altText,
      },
      variants: product.variants.edges.map(({ node: variant }: any) => ({
        id: variant.id,
        title: variant.title,
        price: {
          amount: variant.price.amount,
          currencyCode: variant.price.currencyCode,
        },
        compareAtPrice: variant.compareAtPrice
          ? {
              amount: variant.compareAtPrice.amount,
              currencyCode: variant.compareAtPrice.currencyCode,
            }
          : undefined,
      })),
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}
