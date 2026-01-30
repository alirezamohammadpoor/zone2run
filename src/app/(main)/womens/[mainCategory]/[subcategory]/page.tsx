import type { Metadata } from "next";
import {
  subcategoryMetadata,
  SubcategoryPage,
} from "@/lib/utils/genderRouteHelpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mainCategory: string; subcategory: string }>;
}): Promise<Metadata> {
  const { mainCategory, subcategory } = await params;
  return subcategoryMetadata("womens", mainCategory, subcategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function WomensSubcategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string; subcategory: string }>;
}) {
  const { mainCategory, subcategory } = await params;
  return (
    <SubcategoryPage
      gender="womens"
      mainCategory={mainCategory}
      subcategory={subcategory}
    />
  );
}
