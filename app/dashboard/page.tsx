import { getBudgetsView } from "@/app/budgets/queries";
import { getActiveTasks } from "@/app/tasks/queries";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BudgetPace } from "@/components/dashboard/budget-pace";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { getWalletStats } from "@/lib/points/ledger";
import { settleClosedPeriods } from "@/lib/points/settlement";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Lazy on-read: pay out any periods that closed since the last visit, so the
  // wallet below reflects them.
  await settleClosedPeriods(user.id);

  const [stats, tasks, budgets] = await Promise.all([
    getWalletStats(user.id),
    getActiveTasks(user.id),
    getBudgetsView(user.id),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-5 py-8">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-xs tracking-widest text-muted uppercase">
            {today}
          </p>
          <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight">
            Overview
          </h1>
        </div>
        <SignOutButton />
      </header>

      <WalletCard stats={stats} />

      <TodayTasks tasks={tasks} />

      <BudgetPace budgets={budgets} />
    </div>
  );
}
