import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCategoryMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mainCategory: string; subcategory: string }>;
}): Promise<Metadata> {
  const { mainCategory, subcategory } = await params;
  return buildCategoryMetadata("unisex", mainCategory, subcategory);
}

export default function UnisexSubcategoryPage() {
  notFound();
}
