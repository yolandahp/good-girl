import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { rewards, type Reward } from "@/db/schema";
import { getSpendableBalance } from "@/lib/points/ledger";

export type RewardView = Reward & {
  affordable: boolean;
  /** Points still needed to afford it (0 when affordable). */
  toGo: number;
};

/**
 * The spendable balance plus the user's rewards, each flagged with whether it's
 * affordable now. Sorted affordable-first, then cheapest-first, so the next
 * reachable rewards surface at the top.
 */
export async function getRewardsView(
  userId: string,
): Promise<{ balance: number; rewards: RewardView[] }> {
  const [balance, rows] = await Promise.all([
    getSpendableBalance(userId),
    db
      .select()
      .from(rewards)
      // Redeemed rewards drop off the list — the spend stays in the ledger.
      .where(and(eq(rewards.userId, userId), isNull(rewards.redeemedAt)))
      .orderBy(desc(rewards.createdAt)),
  ]);

  const views: RewardView[] = rows.map((reward) => ({
    ...reward,
    affordable: !reward.redeemedAt && balance >= reward.cost,
    toGo: Math.max(0, reward.cost - balance),
  }));

  views.sort(
    (a, b) => Number(b.affordable) - Number(a.affordable) || a.cost - b.cost,
  );

  return { balance, rewards: views };
}
