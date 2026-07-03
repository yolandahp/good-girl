"use client";

import { useState, useTransition } from "react";

import { redeemReward } from "@/app/rewards/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function RedeemButton({
  rewardId,
  name,
  cost,
}: {
  rewardId: string;
  name: string;
  cost: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const { toast } = useToast();

  function handleClick() {
    if (!window.confirm(`Redeem "${name}" for ${cost} points?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("rewardId", rewardId);
      const result = await redeemReward(formData);
      setError(result.error);
      if (!result.error) toast(`−${cost} · ${name}`);
    });
  }

  return (
    <div className="mt-4">
      <Button
        variant="coral"
        className="w-full"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "Redeeming…" : "Redeem"}
      </Button>
      {error ? (
        <p className="mt-2 text-center text-sm font-medium text-coral">
          {error}
        </p>
      ) : null}
    </div>
  );
}
