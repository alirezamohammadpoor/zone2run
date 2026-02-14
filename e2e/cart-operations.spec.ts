import { test, expect } from "@playwright/test";

const TEST_PRODUCT = "/en-se/products/distance-shorts-1";

test.describe("Cart operations", () => {
  // Helper: add an item to cart and open the cart modal
  async function addItemAndOpenCart(page: import("@playwright/test").Page) {
    await page.goto(TEST_PRODUCT);

    // VariantSelector.tsx: aria-label="Select size {size}"
    const sizeButtons = page.getByRole("button", { name: /^Select size / });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 10000 });
    await sizeButtons.first().click();

    // AddToCart.tsx: "ADD TO CART" when variant selected
    await page
      .getByRole("button", { name: "ADD TO CART", exact: true })
      .click();

    // Wait for success state
    await expect(
      page.getByRole("button", { name: "ADDED TO CART", exact: true })
    ).toBeVisible({ timeout: 5000 });

    // Header.tsx: aria-label="Open cart, {totalItems} items"
    await page.getByRole("button", { name: /Open cart/ }).click();

    // CartModal.tsx: role="dialog" aria-labelledby="cart-title" (text "Cart")
    // 4 dialogs in DOM (nav menu, cart, 2x country). Use name to target cart specifically.
    await expect(page.getByRole("dialog", { name: "Cart" })).toBeVisible({
      timeout: 5000,
    });
  }

  test("increment quantity updates total", async ({ page }) => {
    await addItemAndOpenCart(page);

    const cartModal = page.getByRole("dialog", { name: "Cart" });

    // CartModal.tsx: aria-label="Increase quantity for {item.title}"
    const increaseBtn = cartModal.getByRole("button", {
      name: /Increase quantity for/,
    });
    await expect(increaseBtn).toBeVisible();
    await increaseBtn.click();

    // Quantity span between the +/- buttons should now show 2
    await expect(cartModal.getByText("2")).toBeVisible({ timeout: 3000 });
  });

  test("remove item shows empty cart", async ({ page }) => {
    await addItemAndOpenCart(page);

    const cartModal = page.getByRole("dialog", { name: "Cart" });

    // CartModal.tsx: aria-label="Remove {item.title} from cart"
    const removeBtn = cartModal.getByRole("button", {
      name: /Remove .+ from cart/,
    });
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // CartModal.tsx: empty state text "Your cart is currently empty"
    await expect(
      cartModal.getByText(/cart is currently empty/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
