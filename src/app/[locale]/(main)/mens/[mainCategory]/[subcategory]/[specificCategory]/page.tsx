import type { Metadata } from "next";
import {
  specificCategoryMetadata,
  SpecificCategoryRoute,
} from "@/lib/utils/genderRouteHelpers";

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

export default function MensSpecificCategoryPage({
  params,
}: {
  params: Promise<{
    locale: string;
    mainCategory: string;
    subcategory: string;
    specificCategory: string;
  }>;
}) {
  return <SpecificCategoryRoute gender="mens" params={params} />;
}
