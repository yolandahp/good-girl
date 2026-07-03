import { type Task } from "@/db/schema";

import { type LedgerAppend } from "./ledger";

/**
 * The ledger entry a task completion appends. A one-off task sets
 * `ref_id = task.id` so the unique(source, ref_id) constraint blocks a second
 * award; a repeatable task sets `ref_id = null` so it can be completed again.
 */
export function taskCompletionEntry(
  task: Pick<Task, "id" | "userId" | "points" | "type" | "title">,
): LedgerAppend {
  return {
    userId: task.userId,
    delta: task.points,
    source: "task",
    refId: task.type === "oneoff" ? task.id : null,
    note: task.title,
  };
}
