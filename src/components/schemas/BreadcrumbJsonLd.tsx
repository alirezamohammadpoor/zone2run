import type { BreadcrumbListSchema, BreadcrumbItem } from "./types";

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * Generates JSON-LD structured data for breadcrumb navigation.
 * Helps Google understand page hierarchy and display breadcrumb trails in search results.
 *
 * Usage:
 * - For products: pass getBreadcrumbsFromProduct(product)
 * - For collections: [{ label: "Home", href: "/" }, { label: collectionName, href: `/collections/${slug}` }]
 * - For brands: [{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: brandName, href: `/brands/${slug}` }]
 */
export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";

  // Always prepend Home if not already present
  const breadcrumbItems = items[0]?.href === "/" ? items : [{ label: "Home", href: "/" }, ...items];

  const schema: BreadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((crumb, index) => {
      const isLast = index === breadcrumbItems.length - 1;
      return {
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        // Omit item URL for the last item (current page) per schema.org best practices
        ...(isLast ? {} : { item: `${baseUrl}${crumb.href}` }),
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
