import Link from "next/link";

import { type TaskView } from "@/app/tasks/queries";
import { TaskRow } from "@/components/tasks/task-row";
import { EmptyState } from "@/components/ui/empty-state";

/** Tasks scheduled for today (from the planner), with a done/total count. */
export function TodayTasks({ tasks }: { tasks: TaskView[] }) {
  const top = tasks.slice(0, 4);
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-semibold tracking-tight">
          Today&apos;s tasks
        </h2>
        {tasks.length > 0 ? (
          <Link href="/plan" className="font-mono text-xs text-muted">
            {doneCount} / {tasks.length}
          </Link>
        ) : null}
      </div>

      {top.length === 0 ? (
        <EmptyState
          title="Nothing planned for today"
          description="Head to Plan and schedule tasks onto today."
          action={
            <Link href="/plan" className="text-sm font-medium text-coral">
              Open the planner
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-line rounded-2xl border border-line bg-white">
          {top.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
