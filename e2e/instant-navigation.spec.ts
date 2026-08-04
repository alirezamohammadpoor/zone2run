import { test, expect, type Page } from "@playwright/test";
import { instant } from "@next/playwright";

/**
 * Instant-navigation regression suite (Cache Components + Partial Prefetching).
 *
 * instant() scopes assertions to the UI that is available immediately on a
 * navigation — the static document on initial loads, the prefetched UI on
 * client navigations — so shell regressions surface in CI.
 *
 * Requires the Next.js testing API:
 *   - `next dev` exposes it automatically
 *   - production builds need EXPOSE_TESTING_API=1 at build AND test time
 *     (see next.config.js). Skipped otherwise, e.g. CI against deployed
 *     staging, which does not expose the testing API.
 */
const enabled = process.env.EXPOSE_TESTING_API === "1";

/**
 * Resolves once a runtime prefetch payload for `path` has landed. Shared
 * App Shell prefetch responses are a few hundred bytes; runtime prefetch
 * payloads carry the route content and are orders of magnitude larger.
 * Register before triggering the prefetch (link entering the viewport).
 */
function runtimePrefetch(page: Page, path: string) {
  return page.waitForResponse(
    async (res) => {
      if (!res.url().includes(`${path}?_rsc`)) return false;
      try {
        return (await res.body()).length > 5000;
      } catch {
        return false;
      }
    },
    { timeout: 20000 }
  );
}

test.describe("Instant navigation shells", () => {
  test.skip(
    !enabled,
    "EXPOSE_TESTING_API not set — Next.js testing API unavailable"
  );

  test("home: hero is in the static document on initial load", async ({
    page,
    baseURL,
  }) => {
    await instant(
      page,
      async () => {
        await page.goto("/en-se");
        await expect(page.locator("h1").first()).toBeVisible();
      },
      { baseURL }
    );
  });

  test("mens PLP: heading and product grid are static on initial load", async ({
    page,
    baseURL,
  }) => {
    await instant(
      page,
      async () => {
        await page.goto("/en-se/mens");
        await expect(
          page.locator("h1").filter({ hasText: "Men's" }).first()
        ).toBeVisible();
        await expect(
          page.locator('a[href*="/products/"]').first()
        ).toBeVisible();
      },
      { baseURL }
    );
  });

  test("home: runtime-prefetched hero is instant on client navigation", async ({
    page,
  }) => {
    // The header logo carries prefetch={true}, so /en-se resolves its
    // URL-specific content ahead of the click via runtime prefetching.
    const prefetched = runtimePrefetch(page, "/en-se");
    await page.goto("/en-se/mens");
    await prefetched;

    await instant(page, async () => {
      await page.locator('a[href="/en-se"]:visible').first().click();
      await page.waitForURL((url) => url.pathname === "/en-se");
      await expect(
        page.locator("h1").filter({ hasText: "Find Your Good Place" })
      ).toBeVisible();
    });
  });

  test("category: app shell commits instantly on client navigation, content streams in", async ({
    page,
  }) => {
    await page.goto("/en-se/mens/clothing/bottoms");
    // Breadcrumb links are default-prefetch: navigation commits on the
    // shared App Shell and the category content (URL data) streams in.
    const crumb = page
      .locator('h1 a[href="/en-se/mens/clothing"]:visible')
      .first();
    await expect(crumb).toBeVisible();

    await instant(page, async () => {
      await crumb.click();
      await page.waitForURL((url) => url.pathname === "/en-se/mens/clothing");
      await expect(
        page.locator("h1:visible").filter({ hasText: "Bottoms" })
      ).toHaveCount(0);
    });

    await expect(
      page.locator("h1:visible").filter({ hasText: "Men's / Clothing" }).first()
    ).toBeVisible();
  });

  test("PDP: skeleton shell paints on client navigation, commerce streams in", async ({
    page,
  }) => {
    await page.goto("/en-se/mens");
    const card = page.locator('a[href*="/products/"]:visible').first();
    const href = await card.getAttribute("href");

    await instant(page, async () => {
      await card.click();
      await page.waitForURL((url) => url.pathname === href);
      // Product cards are default-prefetch links: the prefetched shell is
      // the PDP loading skeleton — product content is URL data and streams
      // in after the navigation.
      await expect(page.locator(".animate-pulse").first()).toBeVisible();
    });

    // Once the navigation is released, the real product content arrives.
    await expect(page.locator("h1:visible").first()).not.toHaveText("", {
      timeout: 15000,
    });
  });

  test("PDP: initial load serves the layout shell and streams the product", async ({
    page,
    baseURL,
  }) => {
    await page.goto("/en-se/mens");
    const href = await page
      .locator('a[href*="/products/"]:visible')
      .first()
      .getAttribute("href");

    await instant(
      page,
      async () => {
        await page.goto(href!);
        // The static document for a product URL is the shared layout chrome —
        // the product itself (h1 included) is URL data and streams in.
        await expect(page.getByRole("banner")).toBeVisible();
        await expect(page.locator("h1:visible")).toHaveCount(0);
      },
      { baseURL }
    );

    await expect(page.locator("h1:visible").first()).not.toHaveText("", {
      timeout: 15000,
    });
  });
});
