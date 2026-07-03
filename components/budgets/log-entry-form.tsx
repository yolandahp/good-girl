"use client";

import { useRef, useState, useTransition } from "react";

import { logEntry } from "@/app/budgets/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export function LogEntryForm({
  budgetId,
  label,
}: {
  budgetId: string;
  label: string;
}) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    const amount = String(formData.get("amount") ?? "");
    startTransition(async () => {
      const result = await logEntry(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      formRef.current?.reset();
      toast(`Logged ${amount} · ${label}`);
    });
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="mt-5 border-t border-line pt-4"
    >
      <div className="flex gap-2">
        <input type="hidden" name="budgetId" value={budgetId} />
        <Input
          name="amount"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          placeholder={`Add today's ${label}`}
          required
          className="flex-1 font-mono"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "…" : "Log"}
        </Button>
      </div>
      {error ? (
        <p className="mt-2 text-sm font-medium text-coral">{error}</p>
      ) : null}
    </form>
  );
}
