import { CreateRewardForm } from "@/components/rewards/create-reward-form";
import { RewardCard } from "@/components/rewards/reward-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/supabase/auth";

import { getRewardsView } from "./queries";

export default async function RewardsPage() {
  const user = await getCurrentUser();
  const { balance, rewards } = await getRewardsView(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Rewards
      </h1>

      <p className="text-sm text-muted">
        <span className="font-mono font-bold text-ink">{balance}</span> points
        available to spend.
      </p>

      <CreateRewardForm />

      {rewards.length === 0 ? (
        <EmptyState
          title="No rewards yet"
          description="Add something you want, set its point cost, and redeem it once you've earned enough."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} balance={balance} />
          ))}
        </div>
      )}
    </div>
  );
}
