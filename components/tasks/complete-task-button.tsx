"use client";

import { useFormStatus } from "react-dom";

import { completeTask } from "@/app/tasks/actions";
import { cn } from "@/lib/utils";

function Checkbox({ done, disabled }: { done: boolean; disabled: boolean }) {
  // `pending` disables the button while the action runs, which debounces
  // rapid double-taps on repeatable tasks.
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-label="Complete task"
      className={cn(
        "focusable grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition",
        done
          ? "border-coral bg-coral text-white"
          : "border-line hover:border-ink",
        pending && "opacity-50",
      )}
    >
      {done ? <span className="text-[11px]">✓</span> : null}
    </button>
  );
}

export function CompleteTaskButton({
  taskId,
  done,
  disabled,
}: {
  taskId: string;
  done: boolean;
  disabled: boolean;
}) {
  return (
    <form action={completeTask}>
      <input type="hidden" name="taskId" value={taskId} />
      <Checkbox done={done} disabled={disabled} />
    </form>
  );
}
