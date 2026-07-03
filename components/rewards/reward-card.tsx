import { type RewardView } from "@/app/rewards/queries";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

import { RedeemButton } from "./redeem-button";

export function RewardCard({
  reward,
  balance,
}: {
  reward: RewardView;
  balance: number;
}) {
  const redeemed = reward.redeemedAt !== null;

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-white p-5",
        reward.affordable ? "border-ink" : "border-line",
        redeemed && "opacity-45",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{reward.emoji ?? "🎁"}</span>
        <span className="font-mono text-sm font-bold">{reward.cost}</span>
      </div>

      <p className="mt-3 font-display font-semibold">{reward.name}</p>

      {!reward.affordable && !redeemed ? (
        <div className="mt-2 mb-1">
          <ProgressBar value={balance} max={reward.cost} thin />
          <p className="mt-1 font-mono text-[11px] text-muted">
            {reward.toGo} to go
          </p>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {redeemed ? (
        <div className="mt-4 py-2 text-center text-sm font-semibold text-muted">
          Redeemed
        </div>
      ) : reward.affordable ? (
        <RedeemButton
          rewardId={reward.id}
          name={reward.name}
          cost={reward.cost}
        />
      ) : (
        <div className="mt-4 rounded-lg bg-line py-2 text-center text-sm font-semibold text-muted">
          Locked
        </div>
      )}
    </div>
  );
}
