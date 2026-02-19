import { describe, it, expect } from "vitest";
import {
  localeToCountry,
  countryToLocale,
  isValidLocale,
  getMarketRegion,
  MARKET_REGIONS,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from "@/lib/locale/localeUtils";
import { SUPPORTED_COUNTRIES } from "@/lib/locale/countries";

describe("localeToCountry", () => {
  it("converts 'en-se' to 'SE'", () => {
    expect(localeToCountry("en-se")).toBe("SE");
  });

  it("converts 'en-dk' to 'DK'", () => {
    expect(localeToCountry("en-dk")).toBe("DK");
  });

  it("converts 'en-gb' to 'GB'", () => {
    expect(localeToCountry("en-gb")).toBe("GB");
  });

  it("returns 'SE' as fallback for invalid locale", () => {
    expect(localeToCountry("invalid")).toBe("SE");
  });
});

describe("countryToLocale", () => {
  it("converts 'SE' to 'en-se'", () => {
    expect(countryToLocale("SE")).toBe("en-se");
  });

  it("converts 'DK' to 'en-dk'", () => {
    expect(countryToLocale("DK")).toBe("en-dk");
  });

  it("handles lowercase input", () => {
    expect(countryToLocale("gb")).toBe("en-gb");
  });
});

describe("isValidLocale", () => {
  it("returns true for valid locale 'en-se'", () => {
    expect(isValidLocale("en-se")).toBe(true);
  });

  it("returns false for invalid locale", () => {
    expect(isValidLocale("xx-yy")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidLocale("")).toBe(false);
  });
});

describe("SUPPORTED_LOCALES", () => {
  it("includes 'en-se' (Sweden)", () => {
    expect(SUPPORTED_LOCALES).toContain("en-se");
  });

  it("includes 'en-dk' (Denmark)", () => {
    expect(SUPPORTED_LOCALES).toContain("en-dk");
  });

  it("has more than 10 locales", () => {
    expect(SUPPORTED_LOCALES.length).toBeGreaterThan(10);
  });
});

describe("DEFAULT_LOCALE", () => {
  it("is 'en-se'", () => {
    expect(DEFAULT_LOCALE).toBe("en-se");
  });
});

describe("getMarketRegion", () => {
  it("returns 'nordic' for Sweden", () => {
    expect(getMarketRegion("SE")).toBe("nordic");
  });

  it("returns 'nordic' for Norway", () => {
    expect(getMarketRegion("NO")).toBe("nordic");
  });

  it("returns 'uk' for Great Britain", () => {
    expect(getMarketRegion("GB")).toBe("uk");
  });

  it("returns 'eu' for Germany", () => {
    expect(getMarketRegion("DE")).toBe("eu");
  });

  it("returns 'eu' for Italy", () => {
    expect(getMarketRegion("IT")).toBe("eu");
  });

  it("returns 'eu' for Estonia", () => {
    expect(getMarketRegion("EE")).toBe("eu");
  });

  it("returns undefined for unknown country", () => {
    expect(getMarketRegion("US")).toBeUndefined();
  });

  it("handles lowercase input", () => {
    expect(getMarketRegion("se")).toBe("nordic");
  });

  it("covers every SUPPORTED_COUNTRIES entry", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      expect(getMarketRegion(country)).toBeDefined();
    }
  });

  it("has no duplicate countries across regions", () => {
    const all = Object.values(MARKET_REGIONS).flat();
    const unique = new Set(all);
    expect(all.length).toBe(unique.size);
  });
});
