import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCategoryMetadata } from "@/lib/metadata";

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
  return buildCategoryMetadata("unisex", mainCategory, subcategory, specificCategory);
}

export default function UnisexSpecificCategoryPage() {
  notFound();
}
