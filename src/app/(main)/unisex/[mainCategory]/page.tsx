import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCategoryMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mainCategory: string }>;
}): Promise<Metadata> {
  const { mainCategory } = await params;
  return buildCategoryMetadata("unisex", mainCategory);
}

export default function UnisexMainCategoryPage() {
  notFound();
}
