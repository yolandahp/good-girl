import { getBudgetsView } from "@/app/budgets/queries";
import { getScheduledToday } from "@/app/plan/queries";
import { AppShell } from "@/components/app-shell";
import { BudgetPace } from "@/components/dashboard/budget-pace";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { APP_TIMEZONE } from "@/lib/config";
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
    getScheduledToday(user.id),
    getBudgetsView(user.id),
  ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: APP_TIMEZONE,
  });

  return (
    <AppShell balance={stats.balance}>
      <div className="mx-auto max-w-2xl space-y-8 px-5 py-8">
        <header>
          <p className="text-xs uppercase tracking-widest text-muted">{today}</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight">
            Overview
          </h1>
        </header>

        <WalletCard stats={stats} />

        <TodayTasks tasks={tasks} />

        <BudgetPace budgets={budgets} />
      </div>
    </AppShell>
  );
}
