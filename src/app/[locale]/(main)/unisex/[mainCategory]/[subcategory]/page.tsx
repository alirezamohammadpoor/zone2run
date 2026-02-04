import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCategoryMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string; subcategory: string }>;
}): Promise<Metadata> {
  const { locale, mainCategory, subcategory } = await params;
  return buildCategoryMetadata(locale, "unisex", mainCategory, subcategory);
}

export default function UnisexSubcategoryPage() {
  notFound();
}
