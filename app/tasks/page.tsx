import { AppShell } from "@/components/app-shell";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { TaskList } from "@/components/tasks/task-list";
import { getSpendableBalance } from "@/lib/points/ledger";
import { getCurrentUser } from "@/lib/supabase/auth";

import { getActiveTasks } from "./queries";

export default async function TasksPage() {
  const user = await getCurrentUser();
  const [tasks, balance] = await Promise.all([
    getActiveTasks(user.id),
    getSpendableBalance(user.id),
  ]);

  return (
    <AppShell balance={balance}>
      <div className="mx-auto max-w-2xl space-y-6 px-5 py-8">
        <h1 className="font-display text-2xl font-bold tracking-tight">Tasks</h1>

        <CreateTaskForm />

        <TaskList tasks={tasks} />
      </div>
    </AppShell>
  );
}
