import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCategoryMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; mainCategory: string }>;
}): Promise<Metadata> {
  const { locale, mainCategory } = await params;
  return buildCategoryMetadata(locale, "unisex", mainCategory);
}

export default function UnisexMainCategoryPage() {
  notFound();
}
