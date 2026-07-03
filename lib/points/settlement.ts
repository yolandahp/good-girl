import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  type Budget,
  budgetLogs,
  budgets,
  budgetSettlements,
} from "@/db/schema";

import { appendLedger } from "./ledger";
import { periodBounds, todayUTC } from "./period";

export type PeriodSummary = {
  periodStart: string;
  periodEnd: string;
  total: number;
  withinLimit: boolean;
};

type BudgetLogRow = { logDate: string; amount: string };
type SettleableBudget = Pick<Budget, "period" | "periodLimit">;

/**
 * Pure core of settlement: given a budget's logs and today's date, returns one
 * summary per *closed* period that has logs (end date before today), with the
 * period total and whether it stayed within the limit. Periods with no logs
 * never appear, so empty periods are never paid.
 */
export function closedPeriodSummaries(
  logs: BudgetLogRow[],
  budget: SettleableBudget,
  today: string,
): PeriodSummary[] {
  const totals = new Map<string, { end: string; total: number }>();
  for (const log of logs) {
    const { start, end } = periodBounds(log.logDate, budget.period);
    const current = totals.get(start) ?? { end, total: 0 };
    current.total += Number(log.amount);
    totals.set(start, current);
  }

  const limit = Number(budget.periodLimit);
  const summaries: PeriodSummary[] = [];
  for (const [periodStart, { end, total }] of totals) {
    if (end >= today) continue; // period not closed yet
    summaries.push({
      periodStart,
      periodEnd: end,
      total,
      withinLimit: total <= limit,
    });
  }
  return summaries;
}

/**
 * Persists one period summary. Idempotent: the unique(budget_id, period_start)
 * constraint means a concurrent read that already settled makes the insert a
 * no-op, so no period is ever paid twice. Pays `reward_points` only when the
 * period total stayed within the limit.
 */
async function settlePeriod(
  budget: Budget,
  summary: PeriodSummary,
): Promise<void> {
  await db.transaction(async (tx) => {
    const [settlement] = await tx
      .insert(budgetSettlements)
      .values({
        userId: budget.userId,
        budgetId: budget.id,
        periodStart: summary.periodStart,
        periodEnd: summary.periodEnd,
        total: summary.total.toString(),
        withinLimit: summary.withinLimit,
      })
      .onConflictDoNothing({
        target: [budgetSettlements.budgetId, budgetSettlements.periodStart],
      })
      .returning();

    // Another read settled this period first — nothing to do.
    if (!settlement) return;

    if (summary.withinLimit && budget.rewardPoints > 0) {
      const entry = await appendLedger(tx, {
        userId: budget.userId,
        delta: budget.rewardPoints,
        source: "budget",
        refId: settlement.id,
        note: `${budget.name} — within budget`,
      });
      if (entry) {
        await tx
          .update(budgetSettlements)
          .set({ ledgerId: entry.id })
          .where(eq(budgetSettlements.id, settlement.id));
      }
    }
  });
}

/**
 * Lazy on-read settlement. For every budget the user owns, pays out any period
 * that has closed and has at least one log, unless it's already been settled.
 * Safe to call on every dashboard/budgets load — already-settled periods are
 * skipped via the unique constraint.
 */
export async function settleClosedPeriods(userId: string): Promise<void> {
  const today = todayUTC();

  const [userBudgets, settledRows] = await Promise.all([
    db.select().from(budgets).where(eq(budgets.userId, userId)),
    db
      .select({
        budgetId: budgetSettlements.budgetId,
        periodStart: budgetSettlements.periodStart,
      })
      .from(budgetSettlements)
      .where(eq(budgetSettlements.userId, userId)),
  ]);

  // Skip periods already settled so a page load only writes genuinely new
  // payouts. The unique(budget_id, period_start) constraint still guards the
  // race where two loads settle a brand-new period at once.
  const settled = new Set(
    settledRows.map((r) => `${r.budgetId}|${r.periodStart}`),
  );

  for (const budget of userBudgets) {
    const logs = await db
      .select({ logDate: budgetLogs.logDate, amount: budgetLogs.amount })
      .from(budgetLogs)
      .where(
        and(eq(budgetLogs.budgetId, budget.id), eq(budgetLogs.userId, userId)),
      );
    if (logs.length === 0) continue;

    for (const summary of closedPeriodSummaries(logs, budget, today)) {
      if (settled.has(`${budget.id}|${summary.periodStart}`)) continue;
      await settlePeriod(budget, summary);
    }
  }
}
