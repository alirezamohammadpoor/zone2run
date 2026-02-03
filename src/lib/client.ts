/**
 * Shopify Storefront API client using native fetch().
 *
 * graphql-request used cross-fetch which bypassed Next.js's patched fetch —
 * meaning no Shopify call benefited from ISR/revalidate caching.
 * This wrapper uses the global fetch() that Next.js extends,
 * so callers can pass { cache, next } options for proper caching.
 */

if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
  throw new Error("Missing Shopify store domain");
}

if (!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  throw new Error("Missing Shopify storefront access token");
}

const ENDPOINT = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

const HEADERS = {
  "Content-Type": "application/json",
  "X-Shopify-Storefront-Access-Token":
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
};

export interface ShopifyFetchOptions {
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

interface ShopifyGraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

const shopifyClient = {
  async request<T>(
    query: string,
    variables?: Record<string, unknown>,
    fetchOptions?: ShopifyFetchOptions,
  ): Promise<T> {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ query, variables }),
      ...fetchOptions,
    });

    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
    }

    const json: ShopifyGraphQLResponse<T> = await res.json();

    if (json.errors?.length) {
      throw new Error(json.errors[0].message);
    }

    return json.data;
  },
};

export default shopifyClient;
