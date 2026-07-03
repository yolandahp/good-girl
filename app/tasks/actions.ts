"use server";

import { revalidatePath } from "next/cache";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { tasks } from "@/db/schema";
import { appendLedger } from "@/lib/points/ledger";
import { taskCompletionEntry } from "@/lib/points/task-entry";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createTaskSchema } from "@/lib/validation/task";

export type CreateTaskState = { error?: string };

/** Reads a task id from form data, or null if it isn't a valid uuid. */
function taskIdFrom(formData: FormData): string | null {
  const parsed = z.uuid().safeParse(formData.get("taskId"));
  return parsed.success ? parsed.data : null;
}

export async function createTask(
  formData: FormData,
): Promise<CreateTaskState> {
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

export async function completeTask(formData: FormData) {
  const user = await getCurrentUser();
  const taskId = taskIdFrom(formData);
  if (!taskId) return;

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

  if (!task || task.status !== "active") return;

  await appendLedger(db, taskCompletionEntry(task));

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function archiveTask(formData: FormData) {
  const user = await getCurrentUser();
  const taskId = taskIdFrom(formData);
  if (!taskId) return;

  await db
    .update(tasks)
    .set({ status: "archived" })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)));

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
