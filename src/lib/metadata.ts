import type { Metadata } from "next";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/locale/localeUtils";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";

/**
 * Builds hreflang alternates for all supported locales.
 * Used in generateMetadata() to tell Google about locale variants.
 *
 * @param path - The path WITHOUT locale prefix, e.g. "/products/handle" or "/mens/clothing"
 * @param locale - The current page's locale, used for the canonical URL
 */
export function buildHreflangAlternates(path: string, locale: string) {
  return {
    canonical: `${BASE_URL}/${locale}${path}`,
    languages: {
      "x-default": `${BASE_URL}/${DEFAULT_LOCALE}${path}`,
      ...Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  };
}

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
 * buildCategoryMetadata("en-se", "mens", "clothing", "tops")
 * // → { title: "Tops - Clothing - Men's", description: "Shop tops - clothing - men's at Zone2Run..." }
 */
export function buildCategoryMetadata(
  locale: string,
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

  const path = `/${[gender, mainCategory, subcategory, specificCategory]
    .filter(Boolean)
    .join("/")}`;

  const url = `${BASE_URL}/${locale}${path}`;
  const description = `Shop ${title.toLowerCase()} at Zone2Run. Premium running apparel from Scandinavian brands.`;
  return {
    title,
    description,
    alternates: buildHreflangAlternates(path, locale),
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
// Page metadata builders (accept locale for canonical + hreflang)
// ─────────────────────────────────────────────────────────────────────────────

export function homeMetadata(locale: string): Metadata {
  const url = `${BASE_URL}/${locale}`;
  return {
    title: "Zone2Run - Premium Running Apparel",
    description:
      "Shop premium running gear from top Scandinavian brands. High-performance apparel for dedicated runners.",
    alternates: buildHreflangAlternates("", locale),
    openGraph: {
      title: "Zone2Run - Premium Running Apparel",
      description:
        "Shop premium running gear from top Scandinavian brands. High-performance apparel for dedicated runners.",
      url,
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
}

export function blogMetadata(locale: string): Metadata {
  return {
    title: "Running Blog - Tips & Gear Guides",
    description:
      "Running tips, gear guides, and training insights from Zone2Run.",
    alternates: buildHreflangAlternates("/blog", locale),
    twitter: {
      card: "summary",
      title: "Running Blog - Tips & Gear Guides",
      description:
        "Running tips, gear guides, and training insights from Zone2Run.",
    },
  };
}

export function brandsMetadata(locale: string): Metadata {
  return {
    title: "Brands",
    description:
      "Explore our curated selection of premium running brands at Zone2Run.",
    alternates: buildHreflangAlternates("/brands", locale),
    twitter: {
      card: "summary",
      title: "Brands",
      description:
        "Explore our curated selection of premium running brands at Zone2Run.",
    },
  };
}

export function collectionsMetadata(locale: string): Metadata {
  return {
    title: "Collections",
    description: "Shop our curated collections of running apparel at Zone2Run.",
    alternates: buildHreflangAlternates("/collections", locale),
    twitter: {
      card: "summary",
      title: "Collections",
      description: "Shop our curated collections of running apparel at Zone2Run.",
    },
  };
}

export const orderConfirmationMetadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false, follow: false },
};
