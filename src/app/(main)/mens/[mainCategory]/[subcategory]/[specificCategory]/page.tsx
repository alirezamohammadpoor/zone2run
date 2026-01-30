import type { Metadata } from "next";
import {
  specificCategoryMetadata,
  SpecificCategoryPage,
} from "@/lib/utils/genderRouteHelpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    mainCategory: string;
    subcategory: string;
    specificCategory: string;
  }>;
}): Promise<Metadata> {
  const { mainCategory, subcategory, specificCategory } = await params;
  return specificCategoryMetadata("mens", mainCategory, subcategory, specificCategory);
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
export const revalidate = 3600;

export default async function MensSpecificCategoryPage({
  params,
}: {
  params: Promise<{
    mainCategory: string;
    subcategory: string;
    specificCategory: string;
  }>;
}) {
  const { mainCategory, subcategory, specificCategory } = await params;
  return (
    <SpecificCategoryPage
      gender="mens"
      mainCategory={mainCategory}
      subcategory={subcategory}
      specificCategory={specificCategory}
    />
  );
}
