import Link from "next/link";

import { getActiveTasks } from "@/app/tasks/queries";
import { AppShell } from "@/components/app-shell";
import { Backlog } from "@/components/plan/backlog";
import { MonthGrid } from "@/components/plan/month-grid";
import { PlanBoard } from "@/components/plan/plan-board";
import { addMonths, currentMonth, monthLabel } from "@/lib/calendar";
import { getSpendableBalance } from "@/lib/points/ledger";
import { getCurrentUser } from "@/lib/supabase/auth";

import { getMonthSchedule } from "./queries";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(monthParam ?? "")
    ? monthParam!
    : currentMonth();

  const user = await getCurrentUser();
  const [schedule, tasks, balance] = await Promise.all([
    getMonthSchedule(user.id, month),
    getActiveTasks(user.id),
    getSpendableBalance(user.id),
  ]);

  return (
    <AppShell balance={balance}>
      <div className="mx-auto max-w-6xl px-5 py-8">
        <PlanBoard>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Calendar column — title + arrows live here, and stay put on desktop */}
            <div className="space-y-4 lg:sticky lg:top-8 lg:min-w-0 lg:flex-1">
              <div className="flex min-h-10 items-center justify-between">
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {monthLabel(month)}
                </h1>
                <div className="flex gap-2 font-mono text-sm">
                  <Link
                    href={`/plan?month=${addMonths(month, -1)}`}
                    aria-label="Previous month"
                    className="focusable rounded-lg border border-line px-3 py-1.5 hover:border-ink"
                  >
                    ←
                  </Link>
                  <Link
                    href={`/plan?month=${addMonths(month, 1)}`}
                    aria-label="Next month"
                    className="focusable rounded-lg border border-line px-3 py-1.5 hover:border-ink"
                  >
                    →
                  </Link>
                </div>
              </div>

              <MonthGrid month={month} schedule={schedule} />
            </div>

            {/* Tasks — scrolls alongside the fixed calendar */}
            <div className="lg:w-72 lg:shrink-0">
              <h2 className="mb-4 flex min-h-10 items-center font-display text-2xl font-bold tracking-tight">
                Tasks
              </h2>
              <div className="lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1">
                <Backlog tasks={tasks} />
              </div>
            </div>
          </div>
        </PlanBoard>
      </div>
    </AppShell>
  );
}
