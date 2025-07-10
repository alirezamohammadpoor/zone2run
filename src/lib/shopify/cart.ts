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

// Main cart functions
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
      console.error("Cart creation errors:", cartCreate.userErrors);
      return null;
    }

    return {
      cartId: cartCreate.cart.id,
      checkoutUrl: cartCreate.cart.checkoutUrl,
    };
  } catch (error) {
    console.error("Error creating cart:", error);
    return null;
  }
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<boolean> {
  try {
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
      console.error("Add to cart errors:", cartLinesAdd.userErrors);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return false;
  }
}

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
      console.error("Update cart errors:", cartLinesUpdate.userErrors);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating cart:", error);
    return false;
  }
}

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
      console.error("Remove from cart errors:", cartLinesRemove.userErrors);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return false;
  }
}
