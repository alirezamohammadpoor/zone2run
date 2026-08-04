import type { Metadata } from "next";
import {
  subcategoryMetadata,
  SubcategoryRoute,
} from "@/lib/utils/genderRouteHelpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string; subcategory: string }>;
}): Promise<Metadata> {
  const { locale, mainCategory, subcategory } = await params;
  return subcategoryMetadata(locale, "womens", mainCategory, subcategory);
}

// All content is cached ("use cache" getters, tag-invalidated via Sanity Live + webhook)

export default function WomensSubcategoryPage({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string; subcategory: string }>;
}) {
  return <SubcategoryRoute gender="womens" params={params} />;
}
