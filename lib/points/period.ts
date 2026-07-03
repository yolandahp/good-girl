import { type budgetPeriod } from "@/db/schema";

export type Period = (typeof budgetPeriod.enumValues)[number];

/** A closed/open date range, inclusive, as `YYYY-MM-DD` strings. */
export type DateRange = { start: string; end: string };

/* Dates are handled as UTC calendar days (`YYYY-MM-DD`). Lexicographic string
 * comparison of that format is also chronological, which the callers rely on. */

export function toUTCDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Today's calendar date in UTC, as `YYYY-MM-DD`. */
export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The inclusive start/end of the period containing `dateStr`. Weeks start on
 * Monday; months span the 1st to the last day.
 */
export function periodBounds(dateStr: string, period: Period): DateRange {
  const date = toUTCDate(dateStr);

  if (period === "daily") {
    return { start: dateStr, end: dateStr };
  }

  if (period === "weekly") {
    // getUTCDay: 0=Sun..6=Sat. Days since Monday = (dow + 6) % 7.
    const sinceMonday = (date.getUTCDay() + 6) % 7;
    const start = addDays(date, -sinceMonday);
    return { start: formatUTC(start), end: formatUTC(addDays(start, 6)) };
  }

  // monthly
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0)); // day 0 = last of month
  return { start: formatUTC(start), end: formatUTC(end) };
}

/**
 * Whether the period containing `dateStr` has fully closed relative to
 * `todayStr` — i.e. its end date is strictly before today.
 */
export function isPeriodClosed(
  dateStr: string,
  period: Period,
  todayStr: string,
): boolean {
  return periodBounds(dateStr, period).end < todayStr;
}
