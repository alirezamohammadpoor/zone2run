import type { Metadata } from "next";
import { genderMetadata, GenderPage } from "@/lib/utils/genderRouteHelpers";
import { localeToCountry } from "@/lib/locale/localeUtils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return genderMetadata(locale, "womens");
}

// All content is cached ("use cache" getters, tag-invalidated via Sanity Live + webhook)

export default async function WomensPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const country = localeToCountry(locale);
  return <GenderPage gender="womens" country={country} />;
}
