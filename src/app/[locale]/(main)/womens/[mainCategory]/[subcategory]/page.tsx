import type { Metadata } from "next";
import {
  subcategoryMetadata,
  SubcategoryPage,
} from "@/lib/utils/genderRouteHelpers";
import { localeToCountry } from "@/lib/locale/localeUtils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string; subcategory: string }>;
}): Promise<Metadata> {
  const { locale, mainCategory, subcategory } = await params;
  return subcategoryMetadata(locale, "womens", mainCategory, subcategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

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
