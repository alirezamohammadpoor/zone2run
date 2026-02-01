import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";

/**
 * Formats a URL slug into a human-readable title.
 * "running-shoes" → "Running Shoes"
 */
function formatSegment(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds metadata for category pages (mens, womens, unisex).
 * Constructs SEO-friendly titles from URL segments.
 *
 * @example
 * buildCategoryMetadata("mens", "clothing", "tops")
 * // → { title: "Tops - Clothing - Men's", description: "Shop tops - clothing - men's at Zone2Run..." }
 */
export function buildCategoryMetadata(
  gender: "mens" | "womens" | "unisex",
  mainCategory?: string,
  subcategory?: string,
  specificCategory?: string
): Metadata {
  const genderLabel =
    gender === "mens" ? "Men's" : gender === "womens" ? "Women's" : "Unisex";

  // Build title from most specific to least specific
  const parts = [specificCategory, subcategory, mainCategory]
    .filter(Boolean)
    .map((s) => formatSegment(s!));

  const title = parts.length
    ? `${parts.join(" - ")} - ${genderLabel}`
    : `${genderLabel} Running Gear`;

  const path = [gender, mainCategory, subcategory, specificCategory]
    .filter(Boolean)
    .join("/");

  const url = `${BASE_URL}/${path}`;
  const description = `Shop ${title.toLowerCase()} at Zone2Run. Premium running apparel from Scandinavian brands.`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      url,
      siteName: "Zone2Run",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Static page metadata exports
// ─────────────────────────────────────────────────────────────────────────────

export const homeMetadata: Metadata = {
  title: "Zone2Run - Premium Running Apparel",
  description:
    "Shop premium running gear from top Scandinavian brands. High-performance apparel for dedicated runners.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Zone2Run - Premium Running Apparel",
    description:
      "Shop premium running gear from top Scandinavian brands. High-performance apparel for dedicated runners.",
    url: BASE_URL,
    siteName: "Zone2Run",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Zone2Run - Premium Running Apparel",
    description:
      "Shop premium running gear from top Scandinavian brands. High-performance apparel for dedicated runners.",
  },
};

export const blogMetadata: Metadata = {
  title: "Running Blog - Tips & Gear Guides",
  description:
    "Running tips, gear guides, and training insights from Zone2Run.",
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  twitter: {
    card: "summary",
    title: "Running Blog - Tips & Gear Guides",
    description:
      "Running tips, gear guides, and training insights from Zone2Run.",
  },
};

export const brandsMetadata: Metadata = {
  title: "Brands",
  description:
    "Explore our curated selection of premium running brands at Zone2Run.",
  alternates: {
    canonical: `${BASE_URL}/brands`,
  },
  twitter: {
    card: "summary",
    title: "Brands",
    description:
      "Explore our curated selection of premium running brands at Zone2Run.",
  },
};

export const collectionsMetadata: Metadata = {
  title: "Collections",
  description: "Shop our curated collections of running apparel at Zone2Run.",
  alternates: {
    canonical: `${BASE_URL}/collections`,
  },
  twitter: {
    card: "summary",
    title: "Collections",
    description: "Shop our curated collections of running apparel at Zone2Run.",
  },
};

export const orderConfirmationMetadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false, follow: false },
};
