import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const isCI = !!process.env.CI;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: isCI ? 2 : 1,
  // Run tests serially — cart tests share Shopify state via localStorage
  workers: 1,
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    // Bypass Vercel Deployment Protection for staging E2E in CI
    ...(bypassSecret && {
      extraHTTPHeaders: {
        "x-vercel-protection-bypass": bypassSecret,
      },
    }),
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  // Only start dev server when running locally (CI uses production URL)
  ...(!isCI && {
    webServer: {
      command: "bun dev",
      port: 3000,
      reuseExistingServer: true,
      timeout: 60000,
    },
  }),
});
