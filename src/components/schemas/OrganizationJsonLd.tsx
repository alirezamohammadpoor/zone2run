import type { OrganizationSchema } from "./types";

/**
 * Generates JSON-LD structured data for the organization/business.
 * Placed in root layout to appear on all pages.
 * Helps Google understand the business behind the website.
 */
export default function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zone2run-build.vercel.app";

  const schema: OrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zone2Run",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "Purposefully Curated. Built to Perform. Premium running apparel and gear for the Scandinavian market.",
    // Add social links here when available
    // sameAs: [
    //   "https://instagram.com/zone2run",
    //   "https://facebook.com/zone2run",
    // ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
