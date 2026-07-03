import type { LedgerEntry } from "@/db/schema";

/**
 * Derives the spendable balance from a set of ledger entries: the sum of all
 * deltas (earns are positive, redemptions negative). This is the in-memory
 * counterpart to the SQL `SUM(delta)` in `getSpendableBalance` — the single
 * definition of how points net out. An empty ledger nets to 0.
 */
export function deriveBalance(entries: Pick<LedgerEntry, "delta">[]): number {
  return entries.reduce((sum, entry) => sum + entry.delta, 0);
}
