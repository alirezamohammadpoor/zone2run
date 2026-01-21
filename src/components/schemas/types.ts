// JSON-LD Schema Types for SEO Structured Data
// Based on schema.org specifications

// Product Schema - for PDPs
export interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description?: string;
  image?: string[];
  brand?: BrandSchema;
  sku?: string;
  gtin?: string;
  mpn?: string;
  offers: AggregateOfferSchema | OfferSchema;
}

export interface BrandSchema {
  "@type": "Brand";
  name: string;
}

// AggregateOffer - when product has price range (multiple variants)
export interface AggregateOfferSchema {
  "@type": "AggregateOffer";
  lowPrice: number;
  highPrice: number;
  priceCurrency: string;
  availability: AvailabilityType;
  offerCount: number;
  url?: string;
}

// Single Offer - for products with single price
export interface OfferSchema {
  "@type": "Offer";
  price: number;
  priceCurrency: string;
  availability: AvailabilityType;
  url?: string;
  priceValidUntil?: string;
  itemCondition?: string;
}

// Schema.org availability values
export type AvailabilityType =
  | "https://schema.org/InStock"
  | "https://schema.org/OutOfStock"
  | "https://schema.org/PreOrder"
  | "https://schema.org/Discontinued";

// BreadcrumbList Schema - for navigation trails
export interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbItemSchema[];
}

export interface BreadcrumbItemSchema {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string; // URL - omit for last item (current page)
}

// Organization Schema - site-wide business info
export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[]; // Social media links
  contactPoint?: ContactPointSchema;
}

export interface ContactPointSchema {
  "@type": "ContactPoint";
  contactType: string;
  email?: string;
  telephone?: string;
}

// Helper type for breadcrumb items (matches existing Breadcrumbs.tsx)
export interface BreadcrumbItem {
  label: string;
  href: string;
}
