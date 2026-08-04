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
  return mainCategoryMetadata(locale, "womens", mainCategory);
}

// All content is cached ("use cache" getters, tag-invalidated via Sanity Live + webhook)

export default async function WomensCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string }>;
}) {
  const { locale, mainCategory } = await params;
  const country = localeToCountry(locale);
  return <MainCategoryPage gender="womens" mainCategory={mainCategory} country={country} />;
}
