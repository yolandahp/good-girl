"use client";

import { useRef, useState, useTransition } from "react";

import { createTask } from "@/app/tasks/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CreateTaskForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTask(formData);
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
        + New task
      </Button>
    );
  }

  return (
    <Card>
      <form ref={formRef} action={onSubmit} className="space-y-3">
        <Input name="title" placeholder="Task title" required autoFocus />

        <div className="flex gap-3">
          <Input
            name="points"
            type="number"
            min={1}
            placeholder="Points"
            required
            className="w-28 font-mono"
          />
          <select
            name="type"
            defaultValue="repeatable"
            className="focusable flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          >
            <option value="repeatable">Repeatable</option>
            <option value="oneoff">One-off</option>
          </select>
        </div>

        {error ? (
          <p className="text-sm font-medium text-coral">{error}</p>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add task"}
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
