"use client";

import { type ReactNode, useRef, useState, useTransition } from "react";

import { createReward } from "@/app/rewards/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CreateRewardForm({ heading }: { heading: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createReward(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      formRef.current?.reset();
      setOpen(false);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        {heading}
        <Button
          variant="outline"
          onClick={() => {
            setError(undefined);
            setOpen((o) => !o);
          }}
          className="shrink-0"
        >
          + New reward
        </Button>
      </div>

      {open ? (
        <Card>
          <form ref={formRef} action={onSubmit} className="space-y-3">
            <Input
              name="name"
              placeholder="Reward name (e.g. Bubble tea)"
              required
              autoFocus
            />

            <div className="flex gap-3">
              <Input
                name="emoji"
                placeholder="Emoji"
                className="w-24 text-center"
                maxLength={8}
              />
              <Input
                name="cost"
                type="number"
                min={1}
                placeholder="Cost in points"
                required
                className="flex-1 font-mono"
              />
            </div>

            {error ? (
              <p className="text-sm font-medium text-coral">{error}</p>
            ) : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Adding…" : "Add reward"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError(undefined);
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
