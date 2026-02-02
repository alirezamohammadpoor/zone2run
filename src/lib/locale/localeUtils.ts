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
