import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { ledger, type InsertLedgerEntry, type LedgerEntry } from "@/db/schema";

/** A db handle or an open transaction — both can run these queries. */
type Executor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The fields a caller supplies when recording a point movement. */
export type LedgerAppend = Pick<
  InsertLedgerEntry,
  "userId" | "delta" | "source" | "refId" | "note"
>;

/**
 * The spendable balance, derived as SUM(delta) over the user's ledger. Never
 * stored — always computed from the append-only ledger. Empty ledger = 0.
 */
export async function getSpendableBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({
      balance: sql<string>`coalesce(sum(${ledger.delta}), 0)`,
    })
    .from(ledger)
    .where(eq(ledger.userId, userId));

  return Number(row?.balance ?? 0);
}

/**
 * Appends a point movement to the ledger. Relies on the `unique(source,
 * ref_id)` constraint for idempotency: if a row with the same source + ref_id
 * already exists (e.g. a double-tapped one-off task or reward redeem), the
 * insert is a no-op and `null` is returned. Repeatable completions pass
 * `refId: null`, which never conflicts, so they always insert.
 *
 * Pass a transaction as `executor` to append atomically with other writes.
 */
export async function appendLedger(
  executor: Executor,
  entry: LedgerAppend,
): Promise<LedgerEntry | null> {
  const [row] = await executor
    .insert(ledger)
    .values(entry)
    .onConflictDoNothing()
    .returning();

  return row ?? null;
}

export type WalletStats = {
  balance: number;
  earnedThisWeek: number;
  spentThisWeek: number;
};

/**
 * The wallet summary for the dashboard: spendable balance plus the points
 * earned and spent over the last 7 days. Computed in a single scan of the
 * user's ledger.
 */
export async function getWalletStats(userId: string): Promise<WalletStats> {
  const [row] = await db
    .select({
      balance: sql<string>`coalesce(sum(${ledger.delta}), 0)`,
      earnedThisWeek: sql<string>`coalesce(sum(${ledger.delta}) filter (where ${ledger.delta} > 0 and ${ledger.createdAt} >= now() - interval '7 days'), 0)`,
      spentThisWeek: sql<string>`coalesce(sum(${ledger.delta}) filter (where ${ledger.delta} < 0 and ${ledger.createdAt} >= now() - interval '7 days'), 0)`,
    })
    .from(ledger)
    .where(eq(ledger.userId, userId));

  return {
    balance: Number(row?.balance ?? 0),
    earnedThisWeek: Number(row?.earnedThisWeek ?? 0),
    spentThisWeek: Number(row?.spentThisWeek ?? 0),
  };
}

/** Most recent ledger entries for the activity feed, newest first. */
export async function getLedgerHistory(
  userId: string,
  limit = 20,
): Promise<LedgerEntry[]> {
  return db
    .select()
    .from(ledger)
    .where(eq(ledger.userId, userId))
    .orderBy(desc(ledger.createdAt))
    .limit(limit);
}
