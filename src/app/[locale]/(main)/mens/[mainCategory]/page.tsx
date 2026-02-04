import type { Metadata } from "next";
import {
  mainCategoryMetadata,
  MainCategoryPage,
} from "@/lib/utils/genderRouteHelpers";
import { localeToCountry } from "@/lib/locale/localeUtils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string }>;
}): Promise<Metadata> {
  const { locale, mainCategory } = await params;
  return mainCategoryMetadata(locale, "mens", mainCategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function MensCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string }>;
}) {
  const { locale, mainCategory } = await params;
  const country = localeToCountry(locale);
  return <MainCategoryPage gender="mens" mainCategory={mainCategory} country={country} />;
}
