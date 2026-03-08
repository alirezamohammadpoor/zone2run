import { describe, it, expect } from "vitest";
import { buildCategoryBreadcrumbs } from "@/lib/utils/breadcrumbs";

describe("buildCategoryBreadcrumbs", () => {
  it("returns gender-only breadcrumb when no segments", () => {
    const result = buildCategoryBreadcrumbs("mens");
    expect(result).toEqual([{ label: "Men's", href: "/mens" }]);
  });

  it("formats womens gender correctly", () => {
    const result = buildCategoryBreadcrumbs("womens");
    expect(result[0]).toEqual({ label: "Women's", href: "/womens" });
  });

  it("formats unisex gender correctly", () => {
    const result = buildCategoryBreadcrumbs("unisex");
    expect(result[0]).toEqual({ label: "Unisex", href: "/unisex" });
  });

  it("builds 2-level breadcrumbs with one segment", () => {
    const result = buildCategoryBreadcrumbs("mens", ["clothing"]);
    expect(result).toEqual([
      { label: "Men's", href: "/mens" },
      { label: "Clothing", href: "/mens/clothing" },
    ]);
  });

  it("builds 3-level breadcrumbs with two segments", () => {
    const result = buildCategoryBreadcrumbs("mens", ["clothing", "shorts"]);
    expect(result).toEqual([
      { label: "Men's", href: "/mens" },
      { label: "Clothing", href: "/mens/clothing" },
      { label: "Shorts", href: "/mens/clothing/shorts" },
    ]);
  });

  it("converts hyphenated slugs to title case labels", () => {
    const result = buildCategoryBreadcrumbs("womens", ["running-shorts"]);
    expect(result[1]).toEqual({
      label: "Running Shorts",
      href: "/womens/running-shorts",
    });
  });

  it("handles empty segments array explicitly", () => {
    const result = buildCategoryBreadcrumbs("mens", []);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Men's");
  });

  it("falls back to slug-to-label for unknown gender", () => {
    const result = buildCategoryBreadcrumbs("kids");
    expect(result[0]).toEqual({ label: "Kids", href: "/kids" });
  });
});
