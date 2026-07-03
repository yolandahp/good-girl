import Link from "next/link";

import { type TaskView } from "@/app/tasks/queries";
import { TaskListView } from "@/components/tasks/task-list-view";
import { EmptyState } from "@/components/ui/empty-state";

/** Tasks scheduled for today (from the planner). Completed ones drop off the
 * list but still count toward done/total. */
export function TodayTasks({
  tasks,
  done,
  total,
}: {
  tasks: TaskView[];
  done: number;
  total: number;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-semibold tracking-tight">
          Today&apos;s tasks
        </h2>
        {total > 0 ? (
          <Link href="/plan" className="font-mono text-xs text-muted">
            {done} / {total}
          </Link>
        ) : null}
      </div>

      {total === 0 ? (
        <EmptyState
          title="Nothing planned for today"
          description="Head to Plan and schedule tasks onto today."
          action={
            <Link href="/plan" className="text-sm font-medium text-coral">
              Open the planner
            </Link>
          }
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="All done for today 🎉"
          description="Every task you planned for today is complete."
        />
      ) : (
        <TaskListView tasks={tasks} clearOnComplete />
      )}
    </section>
  );
}
