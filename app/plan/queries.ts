import { and, eq, getTableColumns, gte, isNotNull, lte } from "drizzle-orm";

import { type TaskView } from "@/app/tasks/queries";
import { db } from "@/db/client";
import { ledger, scheduledTasks, tasks } from "@/db/schema";
import { monthGrid } from "@/lib/calendar";
import { todayUTC } from "@/lib/points/period";

export type ScheduledChip = {
  scheduleId: string;
  taskId: string;
  title: string;
  points: number;
  type: "oneoff" | "repeatable";
  done: boolean;
  scheduledDate: string;
};

/**
 * The scheduled chips for the visible month grid, grouped by date. Only active
 * tasks appear; a one-off is `done` once its completion ledger row exists.
 */
export async function getMonthSchedule(
  userId: string,
  monthStr: string,
): Promise<Map<string, ScheduledChip[]>> {
  const grid = monthGrid(monthStr);
  const rangeStart = grid[0].date;
  const rangeEnd = grid[grid.length - 1].date;

  const [rows, completed] = await Promise.all([
    db
      .select({
        scheduleId: scheduledTasks.id,
        taskId: tasks.id,
        title: tasks.title,
        points: tasks.points,
        type: tasks.type,
        scheduledDate: scheduledTasks.scheduledDate,
      })
      .from(scheduledTasks)
      .innerJoin(tasks, eq(scheduledTasks.taskId, tasks.id))
      .where(
        and(
          eq(scheduledTasks.userId, userId),
          eq(tasks.status, "active"),
          gte(scheduledTasks.scheduledDate, rangeStart),
          lte(scheduledTasks.scheduledDate, rangeEnd),
        ),
      ),
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

  const doneOneOff = new Set(completed.map((r) => r.refId));

  const byDate = new Map<string, ScheduledChip[]>();
  for (const r of rows) {
    const chip: ScheduledChip = {
      ...r,
      done: r.type === "oneoff" && doneOneOff.has(r.taskId),
    };
    const list = byDate.get(r.scheduledDate) ?? [];
    list.push(chip);
    byDate.set(r.scheduledDate, list);
  }
  return byDate;
}

/**
 * Active tasks scheduled for today, as `TaskView`s (with `done`), for the
 * dashboard's "today's tasks" section. At most one row per task (a task can't
 * be scheduled on the same day twice).
 */
export async function getScheduledToday(userId: string): Promise<TaskView[]> {
  const today = todayUTC();

  const [rows, completed] = await Promise.all([
    db
      .select(getTableColumns(tasks))
      .from(tasks)
      .innerJoin(
        scheduledTasks,
        and(
          eq(scheduledTasks.taskId, tasks.id),
          eq(scheduledTasks.userId, userId),
          eq(scheduledTasks.scheduledDate, today),
        ),
      )
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "active"))),
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

  const doneOneOff = new Set(completed.map((r) => r.refId));

  return rows
    .map((task) => ({
      ...task,
      done: task.type === "oneoff" && doneOneOff.has(task.id),
    }))
    .filter((task) => !task.done);
}
