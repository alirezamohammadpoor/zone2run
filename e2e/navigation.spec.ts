import { test, expect } from "@playwright/test";

test.describe("PLP to PDP navigation", () => {
  test("navigates from mens category to a product page", async ({ page }) => {
    // Allow extra time for initial SSR compile on dev server
    test.setTimeout(60000);

    await page.goto("/en-se/mens");

    // ProductGrid.tsx wraps ProductCard in <a href="/products/{handle}">
    const productLinks = page.locator('a[href*="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 30000 });

    // Click the first product link
    await productLinks.first().click();

    // PDP loads — URL should contain /products/
    await page.waitForURL(/\/products\//, { timeout: 15000 });

    // Product title is visible (PDP has an h1)
    const heading = page.locator("h1");
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Price with SEK currency code (formatCurrency uses currencyDisplay: "code")
    await expect(page.getByText(/SEK/).first()).toBeVisible({ timeout: 10000 });

    // AddToCart.tsx renders one of: SELECT SIZE | ADD TO CART | OUT OF STOCK
    const addToCartArea = page.getByRole("button", {
      name: /ADD TO CART|SELECT SIZE|OUT OF STOCK/,
    });
    await expect(addToCartArea.first()).toBeVisible({ timeout: 10000 });
  });
});
