import { type BudgetView } from "@/app/budgets/queries";
import { BudgetCard } from "@/components/budgets/budget-card";

/** Budget progress for the dashboard, with quick logging (edit lives on the
 * Budgets page). */
export function BudgetPace({ budgets }: { budgets: BudgetView[] }) {
  if (budgets.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 font-display font-semibold tracking-tight">
        Staying on track
      </h2>
      <div className="space-y-4">
        {budgets.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} showLog />
        ))}
      </div>
    </section>
  );
}
