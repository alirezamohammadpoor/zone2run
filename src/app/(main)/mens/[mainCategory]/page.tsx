import type { Metadata } from "next";
import {
  mainCategoryMetadata,
  MainCategoryPage,
} from "@/lib/utils/genderRouteHelpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}): Promise<Metadata> {
  const { mainCategory } = await params;
  return mainCategoryMetadata("mens", mainCategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function MensCategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}) {
  const { mainCategory } = await params;
  return <MainCategoryPage gender="mens" mainCategory={mainCategory} />;
}
