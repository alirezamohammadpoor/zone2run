import { notFound } from "next/navigation";
import { collectionsMetadata } from "@/lib/metadata";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
