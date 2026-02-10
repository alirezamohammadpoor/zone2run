import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/lib/cart/store";
import type { CartItem } from "@/lib/cart/types";

// Helper — builds a valid CartItem (without quantity, which addItem sets to 1)
function mockItem(overrides?: Partial<CartItem>): Omit<CartItem, "quantity"> {
  return {
    id: "variant-1",
    title: "Nike Pegasus 40",
    price: { amount: 1499, currencyCode: "SEK" },
    image: "/pegasus.jpg",
    variantId: "gid://shopify/ProductVariant/123",
    productHandle: "pegasus-40",
    color: "Black",
    size: "42",
    brand: "Nike",
    ...overrides,
  };
}

// Reset Zustand store between tests (persist middleware caches state)
beforeEach(() => {
  useCartStore.setState({
    items: [],
    isLoading: false,
    error: null,
    shopifyCartId: null,
    shopifyCheckoutUrl: null,
    shopifyLineIds: {},
    country: "SE",
  });
});

describe("Cart Store", () => {
  // ── addItem ──────────────────────────────────────────────────────────────────

  it("adds a new item with quantity 1", () => {
    useCartStore.getState().addItem(mockItem());

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("variant-1");
    expect(items[0].quantity).toBe(1);
    expect(items[0].title).toBe("Nike Pegasus 40");
  });

  it("increments quantity when adding an existing item", () => {
    const item = mockItem();
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  // ── removeItem ───────────────────────────────────────────────────────────────

  it("removes an item by id", () => {
    useCartStore.getState().addItem(mockItem());
    useCartStore.getState().addItem(mockItem({ id: "variant-2", variantId: "gid://shopify/ProductVariant/456" }));

    useCartStore.getState().removeItem("variant-1");

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("variant-2");
  });

  // ── removeAllItems ───────────────────────────────────────────────────────────

  it("removes all items and clears line IDs", () => {
    useCartStore.getState().addItem(mockItem());
    useCartStore.setState({ shopifyLineIds: { "gid://shopify/ProductVariant/123": "line-1" } });

    useCartStore.getState().removeAllItems();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.shopifyLineIds).toEqual({});
  });

  // ── updateQuantity ───────────────────────────────────────────────────────────

  it("updates quantity to the specified value", () => {
    useCartStore.getState().addItem(mockItem());
    useCartStore.getState().updateQuantity("variant-1", 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("clamps negative quantity to 0", () => {
    useCartStore.getState().addItem(mockItem());
    useCartStore.getState().updateQuantity("variant-1", -5);

    expect(useCartStore.getState().items[0].quantity).toBe(0);
  });

  // ── clearCart ────────────────────────────────────────────────────────────────

  it("empties items and shopifyLineIds", () => {
    useCartStore.getState().addItem(mockItem());
    useCartStore.setState({ shopifyLineIds: { "gid://shopify/ProductVariant/123": "line-1" } });

    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.shopifyLineIds).toEqual({});
  });

  // ── Computed getters ─────────────────────────────────────────────────────────

  it("getTotalItems sums quantities across all items", () => {
    useCartStore.getState().addItem(mockItem());
    useCartStore.getState().addItem(mockItem({ id: "variant-2", variantId: "gid://shopify/ProductVariant/456" }));
    useCartStore.getState().updateQuantity("variant-1", 3);

    // variant-1: qty 3, variant-2: qty 1 → total 4
    expect(useCartStore.getState().getTotalItems()).toBe(4);
  });

  it("getTotalPrice sums price × quantity across items", () => {
    useCartStore.getState().addItem(mockItem({ price: { amount: 1000, currencyCode: "SEK" } }));
    useCartStore.getState().addItem(
      mockItem({
        id: "variant-2",
        variantId: "gid://shopify/ProductVariant/456",
        price: { amount: 500, currencyCode: "SEK" },
      })
    );
    useCartStore.getState().updateQuantity("variant-1", 2);

    // variant-1: 1000 × 2 = 2000, variant-2: 500 × 1 = 500 → total 2500
    expect(useCartStore.getState().getTotalPrice()).toBe(2500);
  });

  // ── setCountry ───────────────────────────────────────────────────────────────

  it("invalidates Shopify cart when country changes", () => {
    useCartStore.setState({
      country: "SE",
      shopifyCartId: "gid://shopify/Cart/abc",
      shopifyCheckoutUrl: "https://checkout.shopify.com/abc",
      shopifyLineIds: { "gid://shopify/ProductVariant/123": "line-1" },
    });

    useCartStore.getState().setCountry("NO");

    const state = useCartStore.getState();
    expect(state.country).toBe("NO");
    expect(state.shopifyCartId).toBeNull();
    expect(state.shopifyCheckoutUrl).toBeNull();
    expect(state.shopifyLineIds).toEqual({});
  });

  it("does not reset cart when setting the same country", () => {
    useCartStore.setState({
      country: "SE",
      shopifyCartId: "gid://shopify/Cart/abc",
      shopifyCheckoutUrl: "https://checkout.shopify.com/abc",
    });

    useCartStore.getState().setCountry("SE");

    const state = useCartStore.getState();
    expect(state.shopifyCartId).toBe("gid://shopify/Cart/abc");
    expect(state.shopifyCheckoutUrl).toBe("https://checkout.shopify.com/abc");
  });
});
