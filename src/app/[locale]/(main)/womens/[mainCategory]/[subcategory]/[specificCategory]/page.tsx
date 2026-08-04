import type { Metadata } from "next";
import {
  specificCategoryMetadata,
  SpecificCategoryPage,
} from "@/lib/utils/genderRouteHelpers";
import { localeToCountry } from "@/lib/locale/localeUtils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
    mainCategory: string;
    subcategory: string;
    specificCategory: string;
  }>;
}): Promise<Metadata> {
  const { locale, mainCategory, subcategory, specificCategory } = await params;
  return specificCategoryMetadata(locale, "womens", mainCategory, subcategory, specificCategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
// TODO: Cache Components adoption — restore revalidate = 3600 as cacheLife once this route's data is cached

export default async function WomensSpecificCategoryPage({
  params,
}: {
  params: Promise<{
    locale: string;
    mainCategory: string;
    subcategory: string;
    specificCategory: string;
  }>;
}) {
  const { locale, mainCategory, subcategory, specificCategory } = await params;
  const country = localeToCountry(locale);
  return (
    <SpecificCategoryPage
      gender="womens"
      mainCategory={mainCategory}
      subcategory={subcategory}
      specificCategory={specificCategory}
      country={country}
    />
  );
}
