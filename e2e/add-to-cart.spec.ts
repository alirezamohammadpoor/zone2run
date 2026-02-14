import { test, expect } from "@playwright/test";

const TEST_PRODUCT = "/en-se/products/distance-shorts-1";

test.describe("Add to cart flow", () => {
  test("adds product to cart and verifies", async ({ page }) => {
    await page.goto(TEST_PRODUCT);

    // VariantSelector.tsx: aria-label="Select size {size}"
    const sizeButtons = page.getByRole("button", { name: /^Select size / });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 10000 });
    await sizeButtons.first().click();

    // AddToCart.tsx: button text "ADD TO CART" when variant selected
    await page.getByRole("button", { name: "ADD TO CART", exact: true }).click();

    // AddToCart.tsx: button changes to "ADDED TO CART" after adding (3s timeout then reverts)
    await expect(
      page.getByRole("button", { name: "ADDED TO CART", exact: true })
    ).toBeVisible({ timeout: 5000 });

    // AddedToCartModal.tsx: role="status" with aria-label="{title} added to cart"
    // Use aria-label to disambiguate from ProductGalleryClient's role="status" (image counter)
    await expect(
      page.getByRole("status", { name: /added to cart/i })
    ).toBeVisible({ timeout: 5000 });

    // Header.tsx: aria-label="Open cart, {totalItems} items"
    await expect(
      page.getByRole("button", { name: /Open cart, [1-9]/ })
    ).toBeVisible({ timeout: 5000 });
  });

  test("cart modal shows the added item", async ({ page }) => {
    await page.goto(TEST_PRODUCT);

    // Add item to cart
    const sizeButtons = page.getByRole("button", { name: /^Select size / });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 10000 });
    await sizeButtons.first().click();

    // Wait for Zustand store update → React re-render: SELECT SIZE → ADD TO CART
    const addBtn = page.getByRole("button", { name: "ADD TO CART", exact: true });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    // Wait for success state
    await expect(
      page.getByRole("button", { name: "ADDED TO CART", exact: true })
    ).toBeVisible({ timeout: 5000 });

    // Header.tsx: aria-label="Open cart, {totalItems} items"
    await page.getByRole("button", { name: /Open cart/ }).click();

    // CartModal.tsx: role="dialog" aria-labelledby="cart-title" (text "Cart")
    // 4 dialogs in DOM (nav menu, cart, 2x country). Use name to target cart specifically.
    const cartModal = page.getByRole("dialog", { name: "Cart" });
    await expect(cartModal).toBeVisible({ timeout: 5000 });

    // CartModal.tsx: item price rendered via formatCurrency (SEK code)
    await expect(cartModal.getByText(/SEK/).first()).toBeVisible();
  });
});
