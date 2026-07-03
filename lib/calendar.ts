import { addDays, formatUTC, todayUTC } from "@/lib/points/period";

export type CalendarDay = { date: string; inMonth: boolean; isToday: boolean };

/** Parses "YYYY-MM" into its year and 0-based month. */
function parseMonth(monthStr: string): { year: number; month: number } {
  const [year, month] = monthStr.split("-").map(Number);
  return { year, month: month - 1 };
}

/** The 42-day (6×7) Monday-first grid covering the month of `monthStr`. */
export function monthGrid(
  monthStr: string,
  today: string = todayUTC(),
): CalendarDay[] {
  const { year, month } = parseMonth(monthStr);
  const first = new Date(Date.UTC(year, month, 1));
  const sinceMonday = (first.getUTCDay() + 6) % 7; // 0=Sun..6=Sat -> days since Mon
  const start = addDays(first, -sinceMonday);

  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(start, i);
    const date = formatUTC(d);
    return {
      date,
      inMonth: d.getUTCFullYear() === year && d.getUTCMonth() === month,
      isToday: date === today,
    };
  });
}

/** e.g. "July 2026". */
export function monthLabel(monthStr: string): string {
  const { year, month } = parseMonth(monthStr);
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Shifts "YYYY-MM" by `delta` months. */
export function addMonths(monthStr: string, delta: number): string {
  const { year, month } = parseMonth(monthStr);
  const d = new Date(Date.UTC(year, month + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Today's month as "YYYY-MM". */
export function currentMonth(): string {
  return todayUTC().slice(0, 7);
}
