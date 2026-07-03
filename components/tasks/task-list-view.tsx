"use client";

import { useState } from "react";

import { type TaskView } from "@/app/tasks/queries";

import { TaskRow } from "./task-row";

/**
 * Renders task rows with client-managed order and a completion animation.
 * Completing a task plays a strikethrough + fade, then:
 *  - one-off → removed (done for good),
 *  - repeatable → re-sorts to the bottom (it recurs), unless `clearOnComplete`
 *    is set (e.g. today's list, where completing means done for today) in which
 *    case it's removed too.
 * Completing tasks are kept visible through the animation even after the
 * server has already dropped them. Order is session-local, reconciled from
 * props on every render.
 */
export function TaskListView({
  tasks,
  clearOnComplete = false,
}: {
  tasks: TaskView[];
  clearOnComplete?: boolean;
}) {
  // Canonical order of task ids; only changes on an explicit re-sort/removal.
  const [orderIds, setOrderIds] = useState<string[]>(() =>
    tasks.map((t) => t.id),
  );
  // Tasks mid-animation, kept renderable even once props no longer include them.
  const [completing, setCompleting] = useState<Map<string, TaskView>>(
    new Map(),
  );

  const byId = new Map(tasks.map((t) => [t.id, t]));
  for (const [id, task] of completing) {
    if (!byId.has(id)) byId.set(id, task);
  }

  // Derive the displayed order: keep known order, prepend brand-new tasks, drop
  // any that no longer exist (and aren't still animating out).
  const known = orderIds.filter((id) => byId.has(id));
  const knownSet = new Set(known);
  const fresh = tasks.filter((t) => !knownSet.has(t.id)).map((t) => t.id);
  const ordered = [...fresh, ...known].map((id) => byId.get(id)!);

  function handleCompleted(task: TaskView) {
    setCompleting((prev) => new Map(prev).set(task.id, task));
    setTimeout(() => {
      setOrderIds((prev) => {
        const base = prev.filter((id) => id !== task.id);
        // Repeatable tasks recur → move to the bottom; but when clearing (today's
        // list) or for one-offs, drop them entirely.
        const keep = task.type === "repeatable" && !clearOnComplete;
        return keep ? [...base, task.id] : base;
      });
      setCompleting((prev) => {
        const next = new Map(prev);
        next.delete(task.id);
        return next;
      });
    }, 750);
  }

  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white">
      {ordered.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          completing={completing.has(task.id)}
          onCompleted={() => handleCompleted(task)}
        />
      ))}
    </div>
  );
}
