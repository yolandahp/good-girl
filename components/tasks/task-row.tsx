"use client";

import { useState } from "react";

import { archiveTask } from "@/app/tasks/actions";
import { type TaskView } from "@/app/tasks/queries";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { CompleteTaskButton } from "./complete-task-button";
import { EditTaskForm } from "./edit-task-form";

export function TaskRow({ task }: { task: TaskView }) {
  const [editing, setEditing] = useState(false);
  const lockCompleted = task.done && task.type === "oneoff";

  if (editing) {
    return <EditTaskForm task={task} onDone={() => setEditing(false)} />;
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3.5",
        task.done && "opacity-45",
      )}
    >
      <CompleteTaskButton
        taskId={task.id}
        points={task.points}
        title={task.title}
        done={task.done}
        disabled={lockCompleted}
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-display text-[15px] font-semibold",
            task.done && "line-through",
          )}
        >
          {task.title}
        </p>
        <Badge>{task.type === "oneoff" ? "one-off" : "repeatable"}</Badge>
      </div>

      <span
        className={cn(
          "font-mono text-sm font-bold",
          task.done ? "text-muted" : "text-coral",
        )}
      >
        +{task.points}
      </span>

      <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Edit task"
          className="focusable text-muted hover:text-ink"
        >
          Edit
        </button>
        <form action={archiveTask}>
          <input type="hidden" name="taskId" value={task.id} />
          <button
            type="submit"
            aria-label="Archive task"
            className="focusable text-muted hover:text-ink"
          >
            ×
          </button>
        </form>
      </div>
    </div>
  );
}
