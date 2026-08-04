import type { Metadata } from "next";
import {
  mainCategoryMetadata,
  MainCategoryRoute,
} from "@/lib/utils/genderRouteHelpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string }>;
}): Promise<Metadata> {
  const { locale, mainCategory } = await params;
  return mainCategoryMetadata(locale, "womens", mainCategory);
}

// All content is cached ("use cache" getters, tag-invalidated via Sanity Live + webhook)

export default function WomensCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string }>;
}) {
  return <MainCategoryRoute gender="womens" params={params} />;
}
