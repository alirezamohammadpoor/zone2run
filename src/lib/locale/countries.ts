// Country configuration for locale-based pricing
// Maps ISO 3166-1 alpha-2 codes to Shopify + Intl formatting config

export interface CountryConfig {
  code: string; // ISO 3166-1 alpha-2
  shopifyCode: string; // Shopify CountryCode enum value
  currency: string; // ISO 4217
  locale: string; // BCP 47 for Intl.NumberFormat
  name: string;
}

export const COUNTRY_MAP: Record<string, CountryConfig> = {
  // Nordics
  SE: {
    code: "SE",
    shopifyCode: "SE",
    currency: "SEK",
    locale: "sv-SE",
    name: "Sweden",
  },
  NO: {
    code: "NO",
    shopifyCode: "NO",
    currency: "NOK",
    locale: "nb-NO",
    name: "Norway",
  },
  DK: {
    code: "DK",
    shopifyCode: "DK",
    currency: "DKK",
    locale: "da-DK",
    name: "Denmark",
  },
  FI: {
    code: "FI",
    shopifyCode: "FI",
    currency: "EUR",
    locale: "fi-FI",
    name: "Finland",
  },

  // EU (EUR)
  DE: {
    code: "DE",
    shopifyCode: "DE",
    currency: "EUR",
    locale: "de-DE",
    name: "Germany",
  },
  FR: {
    code: "FR",
    shopifyCode: "FR",
    currency: "EUR",
    locale: "fr-FR",
    name: "France",
  },
  NL: {
    code: "NL",
    shopifyCode: "NL",
    currency: "EUR",
    locale: "nl-NL",
    name: "Netherlands",
  },
  BE: {
    code: "BE",
    shopifyCode: "BE",
    currency: "EUR",
    locale: "nl-BE",
    name: "Belgium",
  },
  AT: {
    code: "AT",
    shopifyCode: "AT",
    currency: "EUR",
    locale: "de-AT",
    name: "Austria",
  },
  IE: {
    code: "IE",
    shopifyCode: "IE",
    currency: "EUR",
    locale: "en-IE",
    name: "Ireland",
  },
  IT: {
    code: "IT",
    shopifyCode: "IT",
    currency: "EUR",
    locale: "it-IT",
    name: "Italy",
  },
  ES: {
    code: "ES",
    shopifyCode: "ES",
    currency: "EUR",
    locale: "es-ES",
    name: "Spain",
  },
  PT: {
    code: "PT",
    shopifyCode: "PT",
    currency: "EUR",
    locale: "pt-PT",
    name: "Portugal",
  },
  LU: {
    code: "LU",
    shopifyCode: "LU",
    currency: "EUR",
    locale: "fr-LU",
    name: "Luxembourg",
  },
  EE: {
    code: "EE",
    shopifyCode: "EE",
    currency: "EUR",
    locale: "et-EE",
    name: "Estonia",
  },
  LV: {
    code: "LV",
    shopifyCode: "LV",
    currency: "EUR",
    locale: "lv-LV",
    name: "Latvia",
  },
  LT: {
    code: "LT",
    shopifyCode: "LT",
    currency: "EUR",
    locale: "lt-LT",
    name: "Lithuania",
  },
  GR: {
    code: "GR",
    shopifyCode: "GR",
    currency: "EUR",
    locale: "el-GR",
    name: "Greece",
  },
  SK: {
    code: "SK",
    shopifyCode: "SK",
    currency: "EUR",
    locale: "sk-SK",
    name: "Slovakia",
  },
  SI: {
    code: "SI",
    shopifyCode: "SI",
    currency: "EUR",
    locale: "sl-SI",
    name: "Slovenia",
  },
  MT: {
    code: "MT",
    shopifyCode: "MT",
    currency: "EUR",
    locale: "mt-MT",
    name: "Malta",
  },
  CY: {
    code: "CY",
    shopifyCode: "CY",
    currency: "EUR",
    locale: "el-CY",
    name: "Cyprus",
  },
  HR: {
    code: "HR",
    shopifyCode: "HR",
    currency: "EUR",
    locale: "hr-HR",
    name: "Croatia",
  },

  // UK
  GB: {
    code: "GB",
    shopifyCode: "GB",
    currency: "GBP",
    locale: "en-GB",
    name: "United Kingdom",
  },
};

export const DEFAULT_COUNTRY = "SE";
export const DEFAULT_CURRENCY = COUNTRY_MAP[DEFAULT_COUNTRY].currency;
export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_MAP);
export const COUNTRY_COOKIE = "z2r-country";

export function getCountryConfig(code: string): CountryConfig {
  return COUNTRY_MAP[code.toUpperCase()] || COUNTRY_MAP[DEFAULT_COUNTRY];
}

/**
 * Client-side: read country from cookie.
 * Safe to import in client components (no next/headers dependency).
 */
export function getCountryFromCookie(): string {
  if (typeof document === "undefined") return DEFAULT_COUNTRY;
  const match = document.cookie.match(
    new RegExp(`${COUNTRY_COOKIE}=(\\w+)`),
  );
  return match?.[1] || DEFAULT_COUNTRY;
}
