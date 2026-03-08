import { test, expect } from "@playwright/test";

const TEST_PRODUCT = "/en-se/products/distance-shorts-1";

test.describe("Variant selection on PDP", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_PRODUCT);
  });

  test("shows SELECT SIZE as default state", async ({ page }) => {
    // AddToCart.tsx: disabled button with text "SELECT SIZE" when no variant selected
    // Use exact: true to avoid matching VariantSelector size buttons (aria-label="Select size XS" etc.)
    await expect(
      page.getByRole("button", { name: "SELECT SIZE", exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

  test("size buttons are visible", async ({ page }) => {
    // VariantSelector.tsx: aria-label="Select size {size}" for each size button
    const sizeButtons = page.getByRole("button", { name: /^Select size / });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 10000 });
    const count = await sizeButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("selecting a size enables ADD TO CART", async ({ page }) => {
    // VariantSelector.tsx: each available size button has aria-label="Select size {size}"
    const sizeButtons = page.getByRole("button", { name: /^Select size / });
    await expect(sizeButtons.first()).toBeVisible({ timeout: 10000 });

    // Click the first available (not disabled) size
    await sizeButtons.first().click();

    // AddToCart.tsx: button text changes to "ADD TO CART" once a variant is selected
    await expect(
      page.getByRole("button", { name: "ADD TO CART", exact: true })
    ).toBeVisible({ timeout: 5000 });
  });
});
