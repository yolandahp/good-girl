"use client";

import { useRef, useState, useTransition } from "react";

import { createBudget } from "@/app/budgets/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function CreateBudgetForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createBudget(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      formRef.current?.reset();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        + New budget
      </Button>
    );
  }

  return (
    <Card>
      <form ref={formRef} action={onSubmit} className="space-y-3">
        <Input name="name" placeholder="Budget name (e.g. Spending)" required autoFocus />

        <div className="flex gap-3">
          <Input name="unit" placeholder="Unit ($, kcal)" className="w-32" />
          <Select name="period" defaultValue="monthly" className="flex-1">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </div>

        <div className="flex gap-3">
          <Input
            name="periodLimit"
            type="number"
            min={1}
            step="any"
            placeholder="Period limit"
            required
            className="flex-1 font-mono"
          />
          <Input
            name="dailyLimit"
            type="number"
            min={1}
            step="any"
            placeholder="Daily limit (optional)"
            className="flex-1 font-mono"
          />
        </div>

        <Input
          name="rewardPoints"
          type="number"
          min={0}
          placeholder="Reward points on close"
          required
          className="font-mono"
        />

        {error ? (
          <p className="text-sm font-medium text-coral">{error}</p>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add budget"}
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
  );
}
