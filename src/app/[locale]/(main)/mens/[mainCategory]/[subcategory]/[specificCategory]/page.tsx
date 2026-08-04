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
  return specificCategoryMetadata(locale, "mens", mainCategory, subcategory, specificCategory);
}

// All content is cached ("use cache" getters, tag-invalidated via Sanity Live + webhook)

export default async function MensSpecificCategoryPage({
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
      gender="mens"
      mainCategory={mainCategory}
      subcategory={subcategory}
      specificCategory={specificCategory}
      country={country}
    />
  );
}
