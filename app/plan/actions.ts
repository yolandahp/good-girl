"use server";

import { revalidatePath } from "next/cache";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { scheduledTasks, tasks } from "@/db/schema";
import { type ActionState } from "@/lib/action-state";
import { uuidField } from "@/lib/form";
import { getCurrentUser } from "@/lib/supabase/auth";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date.");

export async function scheduleTask(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const taskId = uuidField(formData, "taskId");
  const date = dateSchema.safeParse(formData.get("date"));
  if (!taskId || !date.success) return { error: "Invalid schedule." };

  // Confirm the task belongs to this user before scheduling it.
  const [task] = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));
  if (!task) return { error: "Task not found." };

  await db
    .insert(scheduledTasks)
    .values({ userId: user.id, taskId, scheduledDate: date.data })
    .onConflictDoNothing({
      target: [scheduledTasks.taskId, scheduledTasks.scheduledDate],
    });

  revalidatePath("/plan");
  return {};
}

export async function moveScheduled(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const scheduleId = uuidField(formData, "scheduleId");
  const date = dateSchema.safeParse(formData.get("date"));
  if (!scheduleId || !date.success) return { error: "Invalid move." };

  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({ taskId: scheduledTasks.taskId })
      .from(scheduledTasks)
      .where(
        and(
          eq(scheduledTasks.id, scheduleId),
          eq(scheduledTasks.userId, user.id),
        ),
      );
    if (!row) return;

    await tx.delete(scheduledTasks).where(eq(scheduledTasks.id, scheduleId));

    await tx
      .insert(scheduledTasks)
      .values({ userId: user.id, taskId: row.taskId, scheduledDate: date.data })
      .onConflictDoNothing({
        target: [scheduledTasks.taskId, scheduledTasks.scheduledDate],
      });
  });

  revalidatePath("/plan");
  return {};
}

export async function unscheduleTask(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const scheduleId = uuidField(formData, "scheduleId");
  if (!scheduleId) return { error: "Entry not found." };

  await db
    .delete(scheduledTasks)
    .where(
      and(eq(scheduledTasks.id, scheduleId), eq(scheduledTasks.userId, user.id)),
    );

  revalidatePath("/plan");
  return {};
}
