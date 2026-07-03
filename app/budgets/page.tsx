import { AppShell } from "@/components/app-shell";
import { BudgetCard } from "@/components/budgets/budget-card";
import { CreateBudgetForm } from "@/components/budgets/create-budget-form";
import { EmptyState } from "@/components/ui/empty-state";
import { getSpendableBalance } from "@/lib/points/ledger";
import { settleClosedPeriods } from "@/lib/points/settlement";
import { getCurrentUser } from "@/lib/supabase/auth";

import { getBudgetsView } from "./queries";

export default async function BudgetsPage() {
  const user = await getCurrentUser();

  // Lazy on-read: pay out any periods that closed since the last visit.
  await settleClosedPeriods(user.id);
  const [budgets, balance] = await Promise.all([
    getBudgetsView(user.id),
    getSpendableBalance(user.id),
  ]);

  return (
    <AppShell balance={balance}>
      <div className="mx-auto max-w-2xl space-y-6 px-5 py-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Budgets
        </h1>

        <p className="text-sm text-muted">
          Stay under the period limit to earn points when it closes. The daily
          line is just a pacing guide — going over it costs nothing.
        </p>

        <CreateBudgetForm />

        {budgets.length === 0 ? (
          <EmptyState
            title="No budgets yet"
            description="Track spending or calories against a limit and earn points for staying under."
          />
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} showLog />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
