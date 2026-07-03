"use client";

import { useTransition } from "react";

import { completeTask } from "@/app/tasks/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function CompleteTaskButton({
  taskId,
  points,
  title,
  checked,
  disabled,
  onCompleted,
}: {
  taskId: string;
  points: number;
  title: string;
  checked: boolean;
  disabled: boolean;
  onCompleted?: () => void;
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
      if (!awarded) return;
      toast(`+${points} · ${title}`);
      onCompleted?.();
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
        checked
          ? "border-coral bg-coral text-white"
          : "border-line hover:border-ink",
        pending && !checked && "opacity-50",
      )}
    >
      {checked ? <span className="text-[11px]">✓</span> : null}
    </button>
  );
}
