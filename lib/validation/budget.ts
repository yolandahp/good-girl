import { z } from "zod";

export const createBudgetSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(60),
  unit: z.string().trim().max(12).default(""),
  period: z.enum(["daily", "weekly", "monthly"]),
  periodLimit: z.coerce
    .number()
    .positive("Period limit must be greater than 0.")
    .max(1_000_000_000),
  dailyLimit: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce
      .number()
      .positive("Daily limit must be greater than 0.")
      .nullable(),
  ),
  rewardPoints: z.coerce
    .number()
    .int("Reward points must be a whole number.")
    .nonnegative()
    .max(100000),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const logEntrySchema = z.object({
  budgetId: z.uuid(),
  amount: z.coerce
    .number()
    .nonnegative("Amount can't be negative.")
    .max(1_000_000_000),
});

export type LogEntryInput = z.infer<typeof logEntrySchema>;
