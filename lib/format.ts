/**
 * Formats a budget amount with its unit. A single-symbol unit like `$`
 * prefixes the number; a word unit like `kcal` follows it.
 */
export function formatAmount(unit: string, value: number): string {
  if (!unit) return String(value);
  return /^[^\w\s]$/.test(unit) ? `${unit}${value}` : `${value} ${unit}`;
}
