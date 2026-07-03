import { type Reward } from "@/db/schema";

export type RedeemCheck = { ok: true } | { ok: false; reason: string };

/**
 * Pure guard for a redemption: a reward can be redeemed only if it hasn't been
 * already and the balance covers its cost. Returns the reason it can't when it
 * can't. The authoritative check runs inside the redeem transaction against a
 * freshly re-read balance.
 */
export function checkRedeemable(
  balance: number,
  reward: Pick<Reward, "cost" | "redeemedAt">,
): RedeemCheck {
  if (reward.redeemedAt) {
    return { ok: false, reason: "Already redeemed." };
  }
  if (balance < reward.cost) {
    return {
      ok: false,
      reason: `Not enough points — ${reward.cost - balance} to go.`,
    };
  }
  return { ok: true };
}
