export function formatPrice(amount?: number, locale: string = "sv-SE"): string {
  if (typeof amount !== "number" || isNaN(amount)) return "0";

  return new Intl.NumberFormat(locale, {
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

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
