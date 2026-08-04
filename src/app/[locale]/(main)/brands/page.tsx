import { notFound } from "next/navigation";
import { brandsMetadata } from "@/lib/metadata";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return brandsMetadata(locale);
}

export default async function BrandsPage() {
  notFound();
}
