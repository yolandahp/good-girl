"use client";

import { useState, useTransition } from "react";

import { deleteReward, editReward } from "@/app/rewards/actions";
import { type RewardView } from "@/app/rewards/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EditRewardForm({
  reward,
  onDone,
}: {
  reward: RewardView;
  onDone: () => void;
}) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await editReward(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${reward.name}"?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("rewardId", reward.id);
      const result = await deleteReward(formData);
      if (result.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input type="hidden" name="rewardId" value={reward.id} />
      <Input name="name" defaultValue={reward.name} required autoFocus />

      <div className="flex gap-3">
        <Input
          name="emoji"
          defaultValue={reward.emoji ?? ""}
          placeholder="Emoji"
          aria-label="Emoji"
          maxLength={8}
          className="w-24 text-center"
        />
        <Input
          name="cost"
          type="number"
          min={1}
          defaultValue={reward.cost}
          required
          aria-label="Cost in points"
          className="flex-1 font-mono"
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-coral">{error}</p>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onDone}>
            Cancel
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDelete}
          disabled={pending}
          className="border-coral text-coral hover:bg-coral hover:text-white"
        >
          Delete
        </Button>
      </div>
    </form>
  );
}
