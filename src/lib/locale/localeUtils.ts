import { SUPPORTED_COUNTRIES } from "./countries";

/**
 * Locale segment type: "en-se", "en-dk", "en-gb", etc.
 * Format: {language}-{country} (BCP 47-like, lowercase)
 */
export type LocaleSegment = `en-${Lowercase<string>}`;

export const DEFAULT_LOCALE: LocaleSegment = "en-se";

/** "en-se" → "SE" */
export function localeToCountry(locale: string): string {
  return locale.split("-")[1]?.toUpperCase() || "SE";
}

/** "SE" → "en-se" */
export function countryToLocale(country: string): LocaleSegment {
  return `en-${country.toLowerCase()}` as LocaleSegment;
}

/** All valid locale segments derived from SUPPORTED_COUNTRIES */
export const SUPPORTED_LOCALES: LocaleSegment[] =
  SUPPORTED_COUNTRIES.map(countryToLocale);

/** Type guard: is this string a valid locale segment? */
export function isValidLocale(s: string): s is LocaleSegment {
  return SUPPORTED_LOCALES.includes(s as LocaleSegment);
}

/** Market regions group countries into editorial segments for localized content. */
export const MARKET_REGIONS: Record<string, string[]> = {
  nordic: ["SE", "NO", "DK", "FI"],
  uk: ["GB"],
  eu: [
    "DE", "FR", "NL", "BE", "AT", "LU", "IE",
    "IT", "ES", "PT", "EE", "LV", "LT",
    "GR", "SK", "SI", "MT", "CY", "HR",
  ],
};

/** Map a country code to its market region. Returns undefined for unknown countries. */
export function getMarketRegion(country: string): string | undefined {
  const upper = country.toUpperCase();
  for (const [region, countries] of Object.entries(MARKET_REGIONS)) {
    if (countries.includes(upper)) return region;
  }
  return undefined;
}
