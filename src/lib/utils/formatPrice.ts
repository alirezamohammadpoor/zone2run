export function formatPrice(amount?: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "0";

  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrency(
  amount?: number,
  currency: string = "SEK"
): string {
  if (typeof amount !== "number" || isNaN(amount)) return `0 ${currency}`;

  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
