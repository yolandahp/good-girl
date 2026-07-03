import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db/client";
import { budgetLogs, budgets, type Budget } from "@/db/schema";
import { periodBounds, todayUTC } from "@/lib/points/period";

export type BudgetLogEntry = { id: string; logDate: string; amount: number };

export type BudgetView = Budget & {
  periodStart: string;
  periodEnd: string;
  /** Sum of logs in the current (open) period. */
  periodTotal: number;
  /** Sum of logs made today. */
  todayTotal: number;
  /** Individual logs in the current period, most recent first. */
  entries: BudgetLogEntry[];
};

/**
 * Budgets for a user with their current-period totals and individual entries,
 * for rendering the progress bars and the editable log list. Newest budget
 * first.
 */
export async function getBudgetsView(userId: string): Promise<BudgetView[]> {
  const today = todayUTC();

  const rows = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(desc(budgets.createdAt));

  return Promise.all(
    rows.map(async (budget) => {
      const { start, end } = periodBounds(today, budget.period);

      const logs = await db
        .select({
          id: budgetLogs.id,
          logDate: budgetLogs.logDate,
          amount: budgetLogs.amount,
        })
        .from(budgetLogs)
        .where(
          and(
            eq(budgetLogs.budgetId, budget.id),
            eq(budgetLogs.userId, userId),
            gte(budgetLogs.logDate, start),
            lte(budgetLogs.logDate, end),
          ),
        )
        .orderBy(desc(budgetLogs.logDate), desc(budgetLogs.createdAt));

      let periodTotal = 0;
      let todayTotal = 0;
      const entries: BudgetLogEntry[] = logs.map((log) => {
        const amount = Number(log.amount);
        periodTotal += amount;
        if (log.logDate === today) todayTotal += amount;
        return { id: log.id, logDate: log.logDate, amount };
      });

      return {
        ...budget,
        periodStart: start,
        periodEnd: end,
        periodTotal,
        todayTotal,
        entries,
      };
    }),
  );
}
