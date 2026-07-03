import { getActiveTasks } from "@/app/tasks/queries";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { getWalletStats } from "@/lib/points/ledger";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const [stats, tasks] = await Promise.all([
    getWalletStats(user.id),
    getActiveTasks(user.id),
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
          <p className="text-xs uppercase tracking-widest text-muted">{today}</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight">
            Overview
          </h1>
        </div>
        <SignOutButton />
      </header>

      <WalletCard stats={stats} />

      <TodayTasks tasks={tasks} />
    </div>
  );
}
