export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Converts a URL slug to a display label.
 * e.g., "running-shorts" → "Running Shorts"
 */
function slugToLabel(slug: string): string {
  return decodeURIComponent(slug)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Formats gender for display.
 * e.g., "mens" → "Men's", "womens" → "Women's"
 */
function formatGender(gender: string): string {
  switch (gender.toLowerCase()) {
    case "mens":
      return "Men's";
    case "womens":
      return "Women's";
    case "unisex":
      return "Unisex";
    default:
      return slugToLabel(gender);
  }
}

/**
 * Builds breadcrumb items for category pages.
 *
 * @param gender - "mens" | "womens" | "unisex"
 * @param segments - URL path segments after gender, e.g., ["clothing", "shorts"]
 * @returns Array of breadcrumb items with labels and hrefs
 *
 * @example
 * buildCategoryBreadcrumbs("mens", ["clothing", "shorts"])
 * // Returns:
 * // [
 * //   { label: "Men's", href: "/mens" },
 * //   { label: "Clothing", href: "/mens/clothing" },
 * //   { label: "Shorts", href: "/mens/clothing/shorts" }
 * // ]
 */
export function buildCategoryBreadcrumbs(
  gender: string,
  segments: string[] = []
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: formatGender(gender), href: `/${gender}` },
  ];

  let path = `/${gender}`;

  for (const segment of segments) {
    path += `/${segment}`;
    breadcrumbs.push({
      label: slugToLabel(segment),
      href: path,
    });
  }

  return breadcrumbs;
}
