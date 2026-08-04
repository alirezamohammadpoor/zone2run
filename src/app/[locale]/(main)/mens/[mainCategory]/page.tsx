import type { Metadata } from "next";
import {
  mainCategoryMetadata,
  MainCategoryPage,
} from "@/lib/utils/genderRouteHelpers";
import { localeToCountry } from "@/lib/locale/localeUtils";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string }>;
}): Promise<Metadata> {
  const { locale, mainCategory } = await params;
  return mainCategoryMetadata(locale, "mens", mainCategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
// TODO: Cache Components adoption — restore revalidate = 3600 as cacheLife once this route's data is cached

export default async function MensCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string }>;
}) {
  const { locale, mainCategory } = await params;
  const country = localeToCountry(locale);
  return <MainCategoryPage gender="mens" mainCategory={mainCategory} country={country} />;
}
