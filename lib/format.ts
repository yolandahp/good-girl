/** Rounds to at most 2 decimals, dropping floating-point noise and trailing
 * zeros (e.g. 112.01000000000002 -> 112.01, 1000 -> 1000). */
function roundAmount(value: number): number {
  return Number(value.toFixed(2));
}

/** Formats a `YYYY-MM-DD` date as e.g. "Jul 3" (in UTC, matching how dates
 * are stored, so it never shifts a day across timezones). */
export function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Formats a budget amount with its unit. A single-symbol unit like `$`
 * prefixes the number; a word unit like `kcal` follows it.
 */
export function formatAmount(unit: string, value: number): string {
  const amount = roundAmount(value);
  if (!unit) return String(amount);
  return /^[^\w\s]$/.test(unit) ? `${unit}${amount}` : `${amount} ${unit}`;
}
