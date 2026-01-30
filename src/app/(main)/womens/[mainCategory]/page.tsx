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
  return mainCategoryMetadata("womens", mainCategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function WomensCategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}) {
  const { mainCategory } = await params;
  return <MainCategoryPage gender="womens" mainCategory={mainCategory} />;
}
