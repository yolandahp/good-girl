import { sql, type AnyColumn } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";

/**
 * Owner policy for a user-owned table: an authenticated user may only touch
 * rows whose `user_id` matches their auth id. Enabling a policy also turns on
 * RLS for the table. This is a defense-in-depth backstop — the app's direct
 * Postgres connection bypasses RLS, and ownership is enforced in the service
 * layer regardless.
 */
function ownerPolicy(name: string, userIdColumn: AnyColumn) {
  return pgPolicy(name, {
    for: "all",
    to: authenticatedRole,
    using: sql`${authUid} = ${userIdColumn}`,
    withCheck: sql`${authUid} = ${userIdColumn}`,
  });
}

/* -------------------------------------------------------------------------- */
/* Enums                                                                       */
/* -------------------------------------------------------------------------- */

export const taskType = pgEnum("task_type", ["oneoff", "repeatable"]);
export const taskStatus = pgEnum("task_status", ["active", "archived"]);
export const budgetPeriod = pgEnum("budget_period", [
  "daily",
  "weekly",
  "monthly",
]);
export const ledgerSource = pgEnum("ledger_source", [
  "task",
  "budget",
  "redeem",
]);

/* -------------------------------------------------------------------------- */
/* Tables                                                                      */
/*                                                                             */
/* Every user-owned table carries `user_id` (the Supabase auth user). Queries  */
/* are always scoped by it in the service layer; RLS is added as a backstop.   */
/* -------------------------------------------------------------------------- */

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    points: integer("points").notNull(),
    type: taskType("type").notNull(),
    status: taskStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("tasks_user_status_idx").on(t.userId, t.status),
    ownerPolicy("tasks_owner", t.userId),
  ],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    unit: text("unit").notNull().default(""),
    period: budgetPeriod("period").notNull(),
    periodLimit: numeric("period_limit", { precision: 12, scale: 2 }).notNull(),
    dailyLimit: numeric("daily_limit", { precision: 12, scale: 2 }),
    rewardPoints: integer("reward_points").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [ownerPolicy("budgets_owner", t.userId)],
);

export const budgetLogs = pgTable(
  "budget_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("budget_logs_budget_date_idx").on(t.budgetId, t.logDate),
    ownerPolicy("budget_logs_owner", t.userId),
  ],
);

/**
 * Append-only source of truth for points. The spendable balance is derived as
 * SUM(delta) per user — never stored. Corrections are new compensating rows,
 * never updates or deletes.
 *
 * `unique(source, ref_id)` gives idempotency: a one-off task or a reward
 * redemption sets `ref_id` and can be recorded only once. Repeatable task
 * completions set `ref_id = NULL` (NULLs are distinct in Postgres) so they may
 * legitimately repeat.
 */
export const ledger = pgTable(
  "ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    delta: integer("delta").notNull(),
    source: ledgerSource("source").notNull(),
    refId: uuid("ref_id"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ledger_user_idx").on(t.userId),
    unique("ledger_source_ref_unique").on(t.source, t.refId),
    ownerPolicy("ledger_owner", t.userId),
  ],
);

/**
 * Records which budget periods have already paid out, so on-read settlement is
 * idempotent. `unique(budget_id, period_start)` prevents double-payment.
 */
export const budgetSettlements = pgTable(
  "budget_settlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    withinLimit: boolean("within_limit").notNull(),
    ledgerId: uuid("ledger_id").references(() => ledger.id),
    settledAt: timestamp("settled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("budget_settlements_period_unique").on(t.budgetId, t.periodStart),
    ownerPolicy("budget_settlements_owner", t.userId),
  ],
);

export const rewards = pgTable(
  "rewards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    cost: integer("cost").notNull(),
    emoji: text("emoji"),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [ownerPolicy("rewards_owner", t.userId)],
);

/**
 * Planning layer: which tasks the user has placed on which days. Many-to-many
 * (a task may sit on several days). Purely for the calendar planner — it does
 * not touch points, completion, or the ledger.
 */
export const scheduledTasks = pgTable(
  "scheduled_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    scheduledDate: date("scheduled_date").notNull(),
    /** Set when the task is completed on this scheduled day (done for the day). */
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("scheduled_tasks_user_date_idx").on(t.userId, t.scheduledDate),
    unique("scheduled_tasks_task_date_unique").on(t.taskId, t.scheduledDate),
    ownerPolicy("scheduled_tasks_owner", t.userId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Inferred types                                                              */
/* -------------------------------------------------------------------------- */

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;
export type BudgetLog = typeof budgetLogs.$inferSelect;
export type InsertBudgetLog = typeof budgetLogs.$inferInsert;
export type BudgetSettlement = typeof budgetSettlements.$inferSelect;
export type InsertBudgetSettlement = typeof budgetSettlements.$inferInsert;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;
export type LedgerEntry = typeof ledger.$inferSelect;
export type InsertLedgerEntry = typeof ledger.$inferInsert;
export type ScheduledTask = typeof scheduledTasks.$inferSelect;
export type InsertScheduledTask = typeof scheduledTasks.$inferInsert;
