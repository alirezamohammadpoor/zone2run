// Client-safe exports (no next/headers dependency)
export {
  type CountryConfig,
  COUNTRY_MAP,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  SUPPORTED_COUNTRIES,
  COUNTRY_COOKIE,
  getCountryConfig,
} from "./countries";

// Locale URL utilities (client-safe)
export {
  type LocaleSegment,
  DEFAULT_LOCALE,
  localeToCountry,
  countryToLocale,
  SUPPORTED_LOCALES,
  isValidLocale,
} from "./localeUtils";

// Locale React context (client components)
export { LocaleProvider, useLocale } from "./LocaleContext";

export { enrichWithLocalePrices } from "./enrichPrices";
