"use client";

import { useState } from "react";

import { type TaskView } from "@/app/tasks/queries";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { usePlan } from "./plan-board";

const FILTERS = [
  ["all", "All"],
  ["repeatable", "Repeatable"],
  ["oneoff", "One-off"],
] as const;

type Filter = (typeof FILTERS)[number][0];

export function Backlog({ tasks }: { tasks: TaskView[] }) {
  const { selectedTaskId, selectTask } = usePlan();
  const [filter, setFilter] = useState<Filter>("all");

  if (tasks.length === 0) {
    return <p className="text-sm text-muted">No active tasks to plan.</p>;
  }

  const shown = tasks.filter((t) => filter === "all" || t.type === filter);

  return (
    <div className="space-y-3">
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
        <p className="text-sm text-muted">No {filter} tasks.</p>
      ) : (
        <div className="space-y-2">
          {shown.map((task) => (
            <button
              key={task.id}
              type="button"
              draggable
              onClick={() => selectTask(task.id)}
              onDragStart={(e) =>
                e.dataTransfer.setData(
                  "application/json",
                  JSON.stringify({ kind: "task", taskId: task.id }),
                )
              }
              className={cn(
                "focusable w-full cursor-grab rounded-lg border bg-white px-3 py-2 text-left transition active:cursor-grabbing",
                selectedTaskId === task.id ? "border-ink" : "border-line",
              )}
            >
              <p className="truncate font-display text-sm font-semibold">
                {task.title}
              </p>
              <Badge>{task.type === "oneoff" ? "one-off" : "repeatable"}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
