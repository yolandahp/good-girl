"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { budgetLogs, budgets } from "@/db/schema";
import { type ActionState } from "@/lib/action-state";
import { uuidField } from "@/lib/form";
import { today } from "@/lib/points/period";
import { getCurrentUser } from "@/lib/supabase/auth";
import {
  createBudgetSchema,
  type CreateBudgetInput,
  logEntrySchema,
} from "@/lib/validation/budget";

/** Maps validated input to the table's column shape (numerics as strings). */
function budgetColumns({ periodLimit, dailyLimit, ...rest }: CreateBudgetInput) {
  return {
    ...rest,
    periodLimit: periodLimit.toString(),
    dailyLimit: dailyLimit === null ? null : dailyLimit.toString(),
  };
}

function parseBudget(formData: FormData) {
  return createBudgetSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    period: formData.get("period"),
    periodLimit: formData.get("periodLimit"),
    dailyLimit: formData.get("dailyLimit"),
    rewardPoints: formData.get("rewardPoints"),
  });
}

export async function createBudget(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();

  const parsed = parseBudget(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid budget." };
  }

  await db.insert(budgets).values({
    userId: user.id,
    ...budgetColumns(parsed.data),
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return {};
}

export async function editBudget(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const budgetId = uuidField(formData, "budgetId");
  if (!budgetId) return { error: "Budget not found." };

  const parsed = parseBudget(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid budget." };
  }

  await db
    .update(budgets)
    .set(budgetColumns(parsed.data))
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, user.id)));

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteBudget(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const budgetId = uuidField(formData, "budgetId");
  if (!budgetId) return { error: "Budget not found." };

  // Logs and settlements cascade; ledger payouts already earned are kept.
  await db
    .delete(budgets)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, user.id)));

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return {};
}

export async function logEntry(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();

  const parsed = logEntrySchema.safeParse({
    budgetId: formData.get("budgetId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid amount." };
  }

  // Confirm the budget belongs to this user before logging against it.
  const [budget] = await db
    .select({ id: budgets.id })
    .from(budgets)
    .where(
      and(eq(budgets.id, parsed.data.budgetId), eq(budgets.userId, user.id)),
    );
  if (!budget) return { error: "Budget not found." };

  await db.insert(budgetLogs).values({
    userId: user.id,
    budgetId: budget.id,
    logDate: today(),
    amount: parsed.data.amount.toString(),
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return {};
}

const editLogSchema = z.object({
  logId: z.uuid(),
  amount: z.coerce
    .number()
    .nonnegative("Amount can't be negative.")
    .max(1_000_000_000),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
});

export async function editLogEntry(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();

  const parsed = editLogSchema.safeParse({
    logId: formData.get("logId"),
    amount: formData.get("amount"),
    logDate: formData.get("logDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid entry." };
  }

  await db
    .update(budgetLogs)
    .set({
      amount: parsed.data.amount.toString(),
      logDate: parsed.data.logDate,
    })
    .where(
      and(eq(budgetLogs.id, parsed.data.logId), eq(budgetLogs.userId, user.id)),
    );

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteLogEntry(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const logId = uuidField(formData, "logId");
  if (!logId) return { error: "Entry not found." };

  await db
    .delete(budgetLogs)
    .where(and(eq(budgetLogs.id, logId), eq(budgetLogs.userId, user.id)));

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return {};
}
