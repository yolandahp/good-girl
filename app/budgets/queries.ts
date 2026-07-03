import { and, desc, eq, gte } from "drizzle-orm";

import { db } from "@/db/client";
import { type Budget, budgetLogs, budgets } from "@/db/schema";
import { periodBounds, todayUTC } from "@/lib/points/period";

export type BudgetView = Budget & {
  periodStart: string;
  periodEnd: string;
  /** Sum of logs in the current (open) period. */
  periodTotal: number;
  /** Sum of logs made today. */
  todayTotal: number;
};

/**
 * Budgets for a user with their current-period and today totals, for rendering
 * the progress + pacing bars. Newest budget first.
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
        .select({ logDate: budgetLogs.logDate, amount: budgetLogs.amount })
        .from(budgetLogs)
        .where(
          and(
            eq(budgetLogs.budgetId, budget.id),
            eq(budgetLogs.userId, userId),
            gte(budgetLogs.logDate, start),
          ),
        );

      let periodTotal = 0;
      let todayTotal = 0;
      for (const log of logs) {
        const amount = Number(log.amount);
        periodTotal += amount;
        if (log.logDate === today) todayTotal += amount;
      }

      return {
        ...budget,
        periodStart: start,
        periodEnd: end,
        periodTotal,
        todayTotal,
      };
    }),
  );
}
