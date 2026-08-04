import type { Metadata } from "next";
import {
  subcategoryMetadata,
  SubcategoryPage,
} from "@/lib/utils/genderRouteHelpers";
import { localeToCountry } from "@/lib/locale/localeUtils";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string; subcategory: string }>;
}): Promise<Metadata> {
  const { locale, mainCategory, subcategory } = await params;
  return subcategoryMetadata(locale, "womens", mainCategory, subcategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
// TODO: Cache Components adoption — restore revalidate = 3600 as cacheLife once this route's data is cached

export default async function WomensSubcategoryPage({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string; subcategory: string }>;
}) {
  const { locale, mainCategory, subcategory } = await params;
  const country = localeToCountry(locale);
  return (
    <SubcategoryPage
      gender="womens"
      mainCategory={mainCategory}
      subcategory={subcategory}
      country={country}
    />
  );
}
