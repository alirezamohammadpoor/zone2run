import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en-se");
  });

  test("page loads successfully", async ({ page }) => {
    // Title from homeMetadata() in src/lib/metadata.ts
    await expect(page).toHaveTitle("Zone2Run - Premium Running Apparel");
  });

  test("header navigation is visible", async ({ page }) => {
    // Desktop nav buttons from Header.tsx (hidden on mobile via xl:flex)
    const nav = page.locator("header nav");
    await expect(nav).toBeVisible();
  });

  test("search button is accessible", async ({ page }) => {
    // Header.tsx: aria-label="Search products"
    await expect(
      page.getByRole("button", { name: "Search products" })
    ).toBeVisible();
  });

  test("cart button is accessible", async ({ page }) => {
    // Header.tsx: aria-label="Open cart, {totalItems} items"
    await expect(
      page.getByRole("button", { name: /Open cart/ })
    ).toBeVisible();
  });

  test("hero section renders", async ({ page }) => {
    const hero = page.locator("main").first();
    await expect(hero).toBeVisible();
  });

  test("product grid renders with cards", async ({ page }) => {
    // ProductCard.tsx wraps in <article>
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});
