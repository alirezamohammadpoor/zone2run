// lib/shopify/cart.ts
import shopifyClient from "@/lib/client";

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

/**
 * Create a new Shopify cart and return its identifier and checkout URL.
 *
 * @returns An object with `cartId` and `checkoutUrl` for the created cart, or `null` if creation failed (for example due to user errors returned by Shopify or an exception).
 */
export async function createCart(): Promise<{
  cartId: string;
  checkoutUrl: string;
} | null> {
  try {
    const response = await shopifyClient.request(CART_CREATE, {
      input: {},
    });

    const { cartCreate } = response as any;

    if (cartCreate.userErrors.length > 0) {
      return null;
    }

    return {
      cartId: cartCreate.cart.id,
      checkoutUrl: cartCreate.cart.checkoutUrl,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Adds a product variant to a cart by creating or updating a cart line with the given quantity.
 *
 * @param cartId - The ID of the cart to modify.
 * @param variantId - The Shopify ProductVariant global ID (must start with "gid://shopify/ProductVariant/").
 * @param quantity - Number of items to add (defaults to 1).
 * @returns `true` if the line was added successfully, `false` otherwise.
 */
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<boolean> {
  try {
    // Validate variant ID format
    if (!variantId || !variantId.startsWith("gid://shopify/ProductVariant/")) {
      return false;
    }

    const response = await shopifyClient.request(CART_LINES_ADD, {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity,
        },
      ],
    });

    const { cartLinesAdd } = response as any;

    if (cartLinesAdd.userErrors.length > 0) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Update the quantity of a specific line item in a cart.
 *
 * @param cartId - The ID of the cart to update
 * @param lineId - The ID of the cart line to modify
 * @param quantity - The new quantity for the line
 * @returns `true` if the cart line was updated successfully, `false` if the API returned user errors or an error occurred
 */
export async function updateCartQuantity(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<boolean> {
  try {
    const response = await shopifyClient.request(CART_LINES_UPDATE, {
      cartId,
      lines: [
        {
          id: lineId,
          quantity,
        },
      ],
    });

    const { cartLinesUpdate } = response as any;

    if (cartLinesUpdate.userErrors.length > 0) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Removes a line from a Shopify cart.
 *
 * @param cartId - The ID of the cart to modify
 * @param lineId - The ID of the cart line to remove
 * @returns `true` if the line was removed successfully, `false` otherwise
 */
export async function removeFromCart(
  cartId: string,
  lineId: string
): Promise<boolean> {
  try {
    const response = await shopifyClient.request(CART_LINES_REMOVE, {
      cartId,
      lineIds: [lineId],
    });

    const { cartLinesRemove } = response as any;

    if (cartLinesRemove.userErrors.length > 0) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}