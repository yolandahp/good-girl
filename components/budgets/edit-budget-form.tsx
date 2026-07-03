"use client";

import { useState, useTransition } from "react";

import { deleteBudget, editBudget } from "@/app/budgets/actions";
import { type BudgetView } from "@/app/budgets/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function EditBudgetForm({
  budget,
  onDone,
}: {
  budget: BudgetView;
  onDone: () => void;
}) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await editBudget(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        `Delete "${budget.name}"? Its logged history is removed; points already earned stay.`,
      )
    )
      return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("budgetId", budget.id);
      const result = await deleteBudget(formData);
      if (result.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input type="hidden" name="budgetId" value={budget.id} />
      <Input name="name" defaultValue={budget.name} required autoFocus />

      <div className="flex gap-3">
        <Input
          name="unit"
          defaultValue={budget.unit}
          placeholder="Unit"
          aria-label="Unit"
          className="w-32"
        />
        <Select
          name="period"
          defaultValue={budget.period}
          aria-label="Budget period"
          className="flex-1"
        >
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
          defaultValue={Number(budget.periodLimit)}
          required
          aria-label="Period limit"
          className="flex-1 font-mono"
        />
        <Input
          name="dailyLimit"
          type="number"
          min={1}
          step="any"
          defaultValue={budget.dailyLimit === null ? "" : Number(budget.dailyLimit)}
          placeholder="Daily limit (optional)"
          aria-label="Daily limit"
          className="flex-1 font-mono"
        />
      </div>

      <Input
        name="rewardPoints"
        type="number"
        min={0}
        defaultValue={budget.rewardPoints}
        required
        aria-label="Reward points"
        className="font-mono"
      />

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
