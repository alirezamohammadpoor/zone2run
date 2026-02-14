// Cache Intl.NumberFormat instances by key — avoids re-constructing on every call.
// On a PLP with 28+ ProductCards, this saves 27 redundant constructor calls.
const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

export function formatPrice(amount?: number, locale: string = "sv-SE"): string {
  if (typeof amount !== "number" || isNaN(amount)) return "0";

  return getFormatter(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrency(
  amount?: number,
  currency: string = "SEK",
  locale: string = "sv-SE",
): string {
  if (typeof amount !== "number" || isNaN(amount)) return `0 ${currency}`;

  return getFormatter(locale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
