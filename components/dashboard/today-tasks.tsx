import Link from "next/link";

import { type TaskView } from "@/app/tasks/queries";
import { TaskListView } from "@/components/tasks/task-list-view";
import { EmptyState } from "@/components/ui/empty-state";

/** Tasks scheduled for today (from the planner). Completed ones drop off. */
export function TodayTasks({ tasks }: { tasks: TaskView[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-semibold tracking-tight">
          Today&apos;s tasks
        </h2>
        {tasks.length > 0 ? (
          <Link href="/plan" className="font-mono text-xs text-muted">
            {tasks.length} to do
          </Link>
        ) : null}
      </div>

      {tasks.length === 0 ? (
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
        <TaskListView tasks={tasks} clearOnComplete />
      )}
    </section>
  );
}
