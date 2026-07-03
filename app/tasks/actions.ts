"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { scheduledTasks, tasks } from "@/db/schema";
import { type ActionState } from "@/lib/action-state";
import { uuidField } from "@/lib/form";
import { appendLedger } from "@/lib/points/ledger";
import { taskCompletionEntry } from "@/lib/points/task-entry";
import { todayUTC } from "@/lib/points/period";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createTaskSchema } from "@/lib/validation/task";

export async function createTask(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    points: formData.get("points"),
    type: formData.get("type"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task." };
  }

  await db.insert(tasks).values({ userId: user.id, ...parsed.data });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return {};
}

export async function editTask(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const taskId = uuidField(formData, "taskId");
  if (!taskId) return { error: "Task not found." };

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    points: formData.get("points"),
    type: formData.get("type"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task." };
  }

  await db
    .update(tasks)
    .set(parsed.data)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return {};
}

export async function completeTask(
  formData: FormData,
): Promise<{ awarded: boolean }> {
  const user = await getCurrentUser();
  const taskId = uuidField(formData, "taskId");
  if (!taskId) return { awarded: false };

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

  if (!task || task.status !== "active") return { awarded: false };

  // `null` when the one-off was already awarded (unique constraint no-op).
  const entry = await appendLedger(db, taskCompletionEntry(task));

  // Mark today's planned instance done so it stays off today's list.
  await db
    .update(scheduledTasks)
    .set({ completedAt: new Date() })
    .where(
      and(
        eq(scheduledTasks.taskId, task.id),
        eq(scheduledTasks.userId, user.id),
        eq(scheduledTasks.scheduledDate, todayUTC()),
        isNull(scheduledTasks.completedAt),
      ),
    );

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  return { awarded: entry !== null };
}

export async function archiveTask(formData: FormData) {
  const user = await getCurrentUser();
  const taskId = uuidField(formData, "taskId");
  if (!taskId) return;

  await db
    .update(tasks)
    .set({ status: "archived" })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
