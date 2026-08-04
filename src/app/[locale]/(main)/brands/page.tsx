import { notFound } from "next/navigation";
import { brandsMetadata } from "@/lib/metadata";

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
