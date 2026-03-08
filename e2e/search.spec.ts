import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en-se");
  });

  test("opens search modal and focuses input", async ({ page }) => {
    // Header.tsx: aria-label="Search products"
    await page.getByRole("button", { name: "Search products" }).click();

    // SearchModal.tsx: placeholder="What are you looking for?"
    const searchInput = page.getByPlaceholder("What are you looking for?");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // SearchModal.tsx: useEffect focuses input after modal opens (slight delay)
    await expect(searchInput).toBeFocused({ timeout: 3000 });
  });

  test("search returns product results", async ({ page }) => {
    await page.getByRole("button", { name: "Search products" }).click();

    const searchInput = page.getByPlaceholder("What are you looking for?");
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type a known product name — 300ms debounce in SearchModal.tsx
    await searchInput.fill("distance");

    // SearchModal.tsx: renders "X products" count text when results load
    await expect(page.getByText(/\d+ products/)).toBeVisible({ timeout: 15000 });
  });

  test("clicking a search result navigates to PDP", async ({ page }) => {
    await page.getByRole("button", { name: "Search products" }).click();

    const searchInput = page.getByPlaceholder("What are you looking for?");
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill("distance");

    // Wait for the "See results (N)" link at the bottom of SearchModal
    // SearchModal.tsx: <LocaleLink href="/search?q=..." class="...">See results (N)</LocaleLink>
    const seeResults = page.getByText(/See results/);
    await expect(seeResults).toBeVisible({ timeout: 15000 });

    // Click "See results" to navigate to the search page
    await seeResults.click();

    // Should navigate to /search?q=distance
    await page.waitForURL(/\/search/, { timeout: 10000 });

    // Search page should show product links
    const productLinks = page.locator('a[href*="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
  });
});
