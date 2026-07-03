"use client";

import { type ScheduledChip } from "@/app/plan/queries";
import { monthGrid } from "@/lib/calendar";
import { cn } from "@/lib/utils";

import { usePlan } from "./plan-board";
import { TaskChip } from "./task-chip";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthGrid({
  month,
  schedule,
}: {
  month: string;
  schedule: Map<string, ScheduledChip[]>;
}) {
  const { dropOnDay, tapDay } = usePlan();
  const days = monthGrid(month);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="grid grid-cols-7 border-b border-line">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="px-2 py-2 text-center text-[11px] uppercase tracking-wider text-muted"
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <div
            key={day.date}
            onClick={() => tapDay(day.date)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const raw = e.dataTransfer.getData("application/json");
              if (raw) dropOnDay(day.date, JSON.parse(raw));
            }}
            className={cn(
              "min-h-20 cursor-pointer border-b border-r border-line p-1.5 last:border-r-0",
              !day.inMonth && "bg-paper/40",
            )}
          >
            <div
              className={cn(
                "mb-1 font-mono text-[11px]",
                day.isToday
                  ? "font-bold text-coral"
                  : day.inMonth
                    ? "text-ink"
                    : "text-muted",
              )}
            >
              {Number(day.date.slice(-2))}
            </div>
            <div className="space-y-1">
              {(schedule.get(day.date) ?? []).map((chip) => (
                <TaskChip key={chip.scheduleId} chip={chip} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
