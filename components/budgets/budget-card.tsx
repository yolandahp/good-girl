import { type BudgetView } from "@/app/budgets/queries";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatAmount } from "@/lib/format";

import { LogEntryForm } from "./log-entry-form";

export function BudgetCard({
  budget,
  showLog = false,
}: {
  budget: BudgetView;
  showLog?: boolean;
}) {
  const periodLimit = Number(budget.periodLimit);
  const dailyLimit = budget.dailyLimit === null ? null : Number(budget.dailyLimit);
  const over = budget.periodTotal > periodLimit;
  const fmt = (value: number) => formatAmount(budget.unit, value);

  return (
    <Card>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="font-display font-semibold">{budget.name}</p>
          <Badge className="capitalize">
            {budget.period} · +{budget.rewardPoints} pts on close
          </Badge>
        </div>
        <span
          className={`font-mono text-xs ${over ? "text-coral" : "text-muted"}`}
        >
          {over ? "over" : "on track"}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between font-mono text-xs">
            <span className="text-muted">period</span>
            <span>
              {fmt(budget.periodTotal)} / {fmt(periodLimit)}
            </span>
          </div>
          <ProgressBar value={budget.periodTotal} max={periodLimit} />
        </div>

        {dailyLimit !== null ? (
          <div>
            <div className="mb-1.5 flex justify-between font-mono text-xs text-muted">
              <span>today</span>
              <span>
                {fmt(budget.todayTotal)} / {fmt(dailyLimit)}
              </span>
            </div>
            <ProgressBar value={budget.todayTotal} max={dailyLimit} thin />
          </div>
        ) : null}
      </div>

      {showLog ? (
        <LogEntryForm budgetId={budget.id} label={budget.name.toLowerCase()} />
      ) : null}
    </Card>
  );
}
