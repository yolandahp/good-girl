"use client";

import { type ScheduledChip } from "@/app/plan/queries";
import { cn } from "@/lib/utils";

import { usePlan } from "./plan-board";

export function TaskChip({ chip }: { chip: ScheduledChip }) {
  const { removeChip } = usePlan();

  return (
    <div
      draggable
      onDragStart={(e) =>
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({ kind: "chip", scheduleId: chip.scheduleId }),
        )
      }
      className={cn(
        "group flex items-center gap-1 rounded bg-line/60 px-1.5 py-0.5 text-[11px] font-medium",
        chip.done && "text-muted line-through",
      )}
      title={chip.title}
    >
      <span className="min-w-0 flex-1 truncate">{chip.title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeChip(chip.scheduleId);
        }}
        aria-label={`Remove ${chip.title}`}
        className="focusable shrink-0 text-muted opacity-0 group-hover:opacity-100 hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}
