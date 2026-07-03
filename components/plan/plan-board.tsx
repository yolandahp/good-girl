"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import { moveScheduled, scheduleTask, unscheduleTask } from "@/app/plan/actions";

type DragPayload =
  | { kind: "task"; taskId: string }
  | { kind: "chip"; scheduleId: string };

type PlanContextValue = {
  selectedTaskId: string | null;
  selectTask: (taskId: string) => void;
  dropOnDay: (date: string, payload: DragPayload) => void;
  tapDay: (date: string) => void;
  removeChip: (scheduleId: string) => void;
  pending: boolean;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanBoard");
  return ctx;
}

export function PlanBoard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  function schedule(taskId: string, date: string) {
    const fd = new FormData();
    fd.set("taskId", taskId);
    fd.set("date", date);
    run(() => scheduleTask(fd));
  }

  const value: PlanContextValue = {
    selectedTaskId,
    selectTask: (taskId) =>
      setSelectedTaskId((cur) => (cur === taskId ? null : taskId)),
    dropOnDay: (date, payload) => {
      if (payload.kind === "task") schedule(payload.taskId, date);
      else {
        const fd = new FormData();
        fd.set("scheduleId", payload.scheduleId);
        fd.set("date", date);
        run(() => moveScheduled(fd));
      }
    },
    tapDay: (date) => {
      if (!selectedTaskId) return;
      schedule(selectedTaskId, date);
      setSelectedTaskId(null);
    },
    removeChip: (scheduleId) => {
      const fd = new FormData();
      fd.set("scheduleId", scheduleId);
      run(() => unscheduleTask(fd));
    },
    pending,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export type { DragPayload };
