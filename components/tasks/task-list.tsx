"use client";

import { useState } from "react";

import { type TaskView } from "@/app/tasks/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

import { TaskRow } from "./task-row";

const FILTERS = [
  ["all", "All"],
  ["repeatable", "Repeatable"],
  ["oneoff", "One-off"],
] as const;

type Filter = (typeof FILTERS)[number][0];

export function TaskList({ tasks }: { tasks: TaskView[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task to start earning points."
      />
    );
  }

  const shown = tasks.filter((t) => filter === "all" || t.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 text-sm">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "focusable rounded-full px-3 py-1 font-medium transition",
              filter === key ? "bg-ink text-paper" : "text-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="px-1 py-6 text-center text-sm text-muted">
          No {filter} tasks.
        </p>
      ) : (
        <div className="divide-y divide-line rounded-2xl border border-line bg-white">
          {shown.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
