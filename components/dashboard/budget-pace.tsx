import { type BudgetView } from "@/app/budgets/queries";
import { BudgetCard } from "@/components/budgets/budget-card";

/** Read-only budget progress for the dashboard (no log input). */
export function BudgetPace({ budgets }: { budgets: BudgetView[] }) {
  if (budgets.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 font-display font-semibold tracking-tight">
        Budget pace
      </h2>
      <div className="space-y-4">
        {budgets.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} />
        ))}
      </div>
    </section>
  );
}
