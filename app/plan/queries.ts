import { and, eq, getTableColumns, gte, lte } from "drizzle-orm";

import { type TaskView } from "@/app/tasks/queries";
import { db } from "@/db/client";
import { scheduledTasks, tasks } from "@/db/schema";
import { monthGrid } from "@/lib/calendar";
import { today } from "@/lib/points/period";

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
 * tasks appear; a chip is `done` once that day's instance was completed.
 */
export async function getMonthSchedule(
  userId: string,
  monthStr: string,
): Promise<Map<string, ScheduledChip[]>> {
  const grid = monthGrid(monthStr);
  const rangeStart = grid[0].date;
  const rangeEnd = grid[grid.length - 1].date;

  const rows = await db
    .select({
      scheduleId: scheduledTasks.id,
      taskId: tasks.id,
      title: tasks.title,
      points: tasks.points,
      type: tasks.type,
      scheduledDate: scheduledTasks.scheduledDate,
      completedAt: scheduledTasks.completedAt,
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
    );

  const byDate = new Map<string, ScheduledChip[]>();
  for (const r of rows) {
    const chip: ScheduledChip = {
      scheduleId: r.scheduleId,
      taskId: r.taskId,
      title: r.title,
      points: r.points,
      type: r.type,
      scheduledDate: r.scheduledDate,
      done: r.completedAt !== null,
    };
    const list = byDate.get(r.scheduledDate) ?? [];
    list.push(chip);
    byDate.set(r.scheduledDate, list);
  }
  return byDate;
}

export type TodaySchedule = {
  /** Still-to-do tasks scheduled for today (completed ones drop off the list). */
  tasks: TaskView[];
  /** Total tasks scheduled for today. */
  total: number;
  /** How many of today's scheduled tasks are already done. */
  done: number;
};

/**
 * Today's scheduled tasks for the dashboard: the to-do list plus a done/total
 * count. A task can't be scheduled on the same day twice.
 */
export async function getScheduledToday(
  userId: string,
): Promise<TodaySchedule> {
  const todayStr = today();

  const rows = await db
    .select({
      ...getTableColumns(tasks),
      completedAt: scheduledTasks.completedAt,
    })
    .from(tasks)
    .innerJoin(
      scheduledTasks,
      and(
        eq(scheduledTasks.taskId, tasks.id),
        eq(scheduledTasks.userId, userId),
        eq(scheduledTasks.scheduledDate, todayStr),
      ),
    )
    .where(and(eq(tasks.userId, userId), eq(tasks.status, "active")));

  const done = rows.filter((r) => r.completedAt !== null).length;
  const pending = rows
    .filter((r) => r.completedAt === null)
    .map((r) => ({ ...r, done: false })) as TaskView[];

  return { tasks: pending, total: rows.length, done };
}
