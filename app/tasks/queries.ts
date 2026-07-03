import { and, desc, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db/client";
import { ledger, tasks, type Task } from "@/db/schema";

export type TaskView = Task & {
  /** True when a one-off task has already been completed (has a ledger row). */
  done: boolean;
};

/**
 * Active tasks for a user, newest first, each flagged with whether it's done.
 * A one-off is done once its completion ledger row exists (ref_id = task.id);
 * repeatable tasks are never "done" — they can be completed again and again.
 */
export async function getActiveTasks(userId: string): Promise<TaskView[]> {
  const [rows, completed] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "active")))
      .orderBy(desc(tasks.createdAt)),
    db
      .select({ refId: ledger.refId })
      .from(ledger)
      .where(
        and(
          eq(ledger.userId, userId),
          eq(ledger.source, "task"),
          isNotNull(ledger.refId),
        ),
      ),
  ]);

  const completedOneOff = new Set(completed.map((r) => r.refId));

  return (
    rows
      .map((task) => ({
        ...task,
        done: task.type === "oneoff" && completedOneOff.has(task.id),
      }))
      // A completed one-off has served its purpose — drop it from the active list.
      .filter((task) => !task.done)
  );
}
