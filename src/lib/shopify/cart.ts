// lib/shopify/cart.ts
import shopifyClient from "@/lib/client";

// Shopify Cart API Response Types
interface ShopifyUserError {
  field: string[];
  message: string;
}

interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price: ShopifyMoney;
          product: {
            title: string;
            handle: string;
            featuredImage: {
              url: string;
              altText: string | null;
            } | null;
          };
        };
      };
    }>;
  };
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
}

interface CartCreateResponse {
  cartCreate: {
    cart: ShopifyCart;
    userErrors: ShopifyUserError[];
  };
}

interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: ShopifyCart;
    userErrors: ShopifyUserError[];
  };
}

interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: ShopifyCart;
    userErrors: ShopifyUserError[];
  };
}

interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart: ShopifyCart;
    userErrors: ShopifyUserError[];
  };
}

// GraphQL mutations for cart operations
export const CART_CREATE = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_ADD = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Query to fetch an existing cart (used for hydration on page load)
const CART_QUERY = `
  query cart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                  featuredImage {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

interface CartQueryResponse {
  cart: ShopifyCart | null;
}

/** Extract variantId → Shopify lineId mapping from cart response */
function extractLineIds(cart: ShopifyCart): Record<string, string> {
  const map: Record<string, string> = {};
  for (const edge of cart.lines.edges) {
    map[edge.node.merchandise.id] = edge.node.id;
  }
  return map;
}

// Main cart functions
export async function createCart(
  lines?: { variantId: string; quantity: number }[],
  country?: string,
): Promise<{
  cartId: string;
  checkoutUrl: string;
  lineIds: Record<string, string>;
} | null> {
  try {
    const input: Record<string, unknown> = {};

    if (lines?.length) {
      input.lines = lines.map((l) => ({
        merchandiseId: l.variantId,
        quantity: l.quantity,
      }));
    }

    if (country) {
      input.buyerIdentity = { countryCode: country };
    }

    const response = await shopifyClient.request(
      CART_CREATE,
      { input },
      { cache: "no-store" },
    );

    const { cartCreate } = response as CartCreateResponse;

    if (cartCreate.userErrors.length > 0) {
      return null;
    }

    return {
      cartId: cartCreate.cart.id,
      checkoutUrl: cartCreate.cart.checkoutUrl,
      lineIds: extractLineIds(cartCreate.cart),
    };
  } catch (error) {
    return null;
  }
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<{ success: boolean; lineId?: string }> {
  try {
    // Validate variant ID format
    if (!variantId || !variantId.startsWith("gid://shopify/ProductVariant/")) {
      return { success: false };
    }

    const response = await shopifyClient.request(
      CART_LINES_ADD,
      {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      },
      { cache: "no-store" },
    );

    const { cartLinesAdd } = response as CartLinesAddResponse;

    if (cartLinesAdd.userErrors.length > 0) {
      return { success: false };
    }

    // Find the line ID for the added variant
    const lineId = extractLineIds(cartLinesAdd.cart)[variantId];
    return { success: true, lineId };
  } catch (error) {
    return { success: false };
  }
}

export async function updateCartQuantity(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<boolean> {
  try {
    const response = await shopifyClient.request(
      CART_LINES_UPDATE,
      { cartId, lines: [{ id: lineId, quantity }] },
      { cache: "no-store" },
    );

    const { cartLinesUpdate } = response as CartLinesUpdateResponse;

    if (cartLinesUpdate.userErrors.length > 0) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function removeFromCart(
  cartId: string,
  lineId: string
): Promise<boolean> {
  try {
    const response = await shopifyClient.request(
      CART_LINES_REMOVE,
      { cartId, lineIds: [lineId] },
      { cache: "no-store" },
    );

    const { cartLinesRemove } = response as CartLinesRemoveResponse;

    if (cartLinesRemove.userErrors.length > 0) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Fetch an existing cart by ID.
 * Returns null if the cart has expired or doesn't exist (Shopify carts expire after ~7 days).
 */
export async function getCart(
  cartId: string,
): Promise<{
  id: string;
  checkoutUrl: string;
  lineIds: Record<string, string>;
} | null> {
  try {
    const response = await shopifyClient.request(
      CART_QUERY,
      { cartId },
      { cache: "no-store" },
    );

    const { cart } = response as CartQueryResponse;

    if (!cart) return null;

    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      lineIds: extractLineIds(cart),
    };
  } catch {
    return null;
  }
}
