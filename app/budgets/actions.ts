"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { budgetLogs, budgets } from "@/db/schema";
import { type ActionState } from "@/lib/action-state";
import { todayUTC } from "@/lib/points/period";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createBudgetSchema, logEntrySchema } from "@/lib/validation/budget";

export async function createBudget(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();

  const parsed = createBudgetSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    period: formData.get("period"),
    periodLimit: formData.get("periodLimit"),
    dailyLimit: formData.get("dailyLimit"),
    rewardPoints: formData.get("rewardPoints"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid budget." };
  }

  const { periodLimit, dailyLimit, ...rest } = parsed.data;
  await db.insert(budgets).values({
    userId: user.id,
    ...rest,
    periodLimit: periodLimit.toString(),
    dailyLimit: dailyLimit === null ? null : dailyLimit.toString(),
  });

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
    logDate: todayUTC(),
    amount: parsed.data.amount.toString(),
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return {};
}
