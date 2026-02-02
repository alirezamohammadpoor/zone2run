import { notFound } from "next/navigation";
import { buildCategoryMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildCategoryMetadata(locale, "unisex");
}

export default function UnisexPage() {
  notFound();
}
