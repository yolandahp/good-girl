"use client";

import { useState } from "react";

import { type RewardView } from "@/app/rewards/queries";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

import { EditRewardForm } from "./edit-reward-form";
import { RedeemButton } from "./redeem-button";

export function RewardCard({
  reward,
  balance,
}: {
  reward: RewardView;
  balance: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-2xl border border-ink bg-white p-5">
        <EditRewardForm reward={reward} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-white p-5",
        reward.affordable ? "border-ink" : "border-line",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{reward.emoji ?? "🎁"}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit reward"
            className="focusable text-xs font-medium text-muted hover:text-ink"
          >
            Edit
          </button>
          <span className="font-mono text-sm font-bold">{reward.cost}</span>
        </div>
      </div>

      <p className="mt-3 font-display font-semibold">{reward.name}</p>

      {reward.affordable ? (
        <div className="flex-1" />
      ) : (
        <div className="mt-2 mb-1">
          <ProgressBar value={balance} max={reward.cost} thin />
          <p className="mt-1 font-mono text-[11px] text-muted">
            {reward.toGo} to go
          </p>
        </div>
      )}

      {reward.affordable ? (
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
