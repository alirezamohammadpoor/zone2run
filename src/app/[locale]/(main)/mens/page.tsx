import type { Metadata } from "next";
import { genderMetadata, GenderPage } from "@/lib/utils/genderRouteHelpers";
import { localeToCountry } from "@/lib/locale/localeUtils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return genderMetadata(locale, "mens");
}

// ISR: Revalidate every hour, on-demand via Sanity webhook
// TODO: Cache Components adoption — restore revalidate = 3600 as cacheLife once this route's data is cached

export default async function MensPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const country = localeToCountry(locale);
  return <GenderPage gender="mens" country={country} />;
}
