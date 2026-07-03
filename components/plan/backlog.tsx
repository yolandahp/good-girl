"use client";

import { type TaskView } from "@/app/tasks/queries";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { usePlan } from "./plan-board";

export function Backlog({ tasks }: { tasks: TaskView[] }) {
  const { selectedTaskId, selectTask } = usePlan();

  if (tasks.length === 0) {
    return <p className="text-sm text-muted">No active tasks to plan.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
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
  );
}
