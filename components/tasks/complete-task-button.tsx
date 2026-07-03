"use client";

import { useTransition } from "react";

import { completeTask } from "@/app/tasks/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function CompleteTaskButton({
  taskId,
  points,
  title,
  done,
  disabled,
}: {
  taskId: string;
  points: number;
  title: string;
  done: boolean;
  disabled: boolean;
}) {
  // `pending` disables the button while the action runs, which debounces
  // rapid double-taps on repeatable tasks.
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleClick() {
    if (disabled || pending) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("taskId", taskId);
      const { awarded } = await completeTask(formData);
      if (awarded) toast(`+${points} · ${title}`);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      aria-label={`Complete ${title}`}
      className={cn(
        "focusable grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition",
        done ? "border-coral bg-coral text-white" : "border-line hover:border-ink",
        pending && "opacity-50",
      )}
    >
      {done ? <span className="text-[11px]">✓</span> : null}
    </button>
  );
}
