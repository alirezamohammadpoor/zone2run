import { describe, it, expect } from "vitest";
import { formatPrice, formatCurrency } from "@/lib/utils/formatPrice";

describe("formatPrice", () => {
  it("formats a whole number with thousands separator", () => {
    const result = formatPrice(1499);
    // sv-SE uses non-breaking space as thousands separator
    expect(result.replace(/\s/g, " ")).toBe("1 499");
  });

  it("returns '0' for zero", () => {
    expect(formatPrice(0)).toBe("0");
  });

  it("returns '0' for undefined", () => {
    expect(formatPrice(undefined)).toBe("0");
  });

  it("returns '0' for NaN", () => {
    expect(formatPrice(NaN)).toBe("0");
  });

  it("rounds decimals to whole number", () => {
    const result = formatPrice(1499.95);
    expect(result.replace(/\s/g, " ")).toBe("1 500");
  });
});

describe("formatCurrency", () => {
  it("formats SEK with currency code, not symbol", () => {
    const result = formatCurrency(1499, "SEK", "sv-SE");
    expect(result).toContain("SEK");
    expect(result).not.toContain("kr");
  });

  it("formats GBP with currency code, not symbol", () => {
    const result = formatCurrency(1499, "GBP", "en-GB");
    expect(result).toContain("GBP");
    expect(result).not.toContain("£");
  });

  it("formats EUR with currency code, not symbol", () => {
    const result = formatCurrency(1499, "EUR", "de-DE");
    expect(result).toContain("EUR");
    expect(result).not.toContain("€");
  });

  it("formats DKK with currency code", () => {
    const result = formatCurrency(999, "DKK", "da-DK");
    expect(result).toContain("DKK");
  });

  it("returns '0 CURRENCY' for undefined amount", () => {
    expect(formatCurrency(undefined, "SEK")).toBe("0 SEK");
  });

  it("returns '0 CURRENCY' for NaN amount", () => {
    expect(formatCurrency(NaN, "DKK")).toBe("0 DKK");
  });
});
