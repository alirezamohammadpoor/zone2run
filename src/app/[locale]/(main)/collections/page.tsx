import { notFound } from "next/navigation";
import { collectionsMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return collectionsMetadata(locale);
}

export default async function CollectionsPage() {
  notFound();
}
