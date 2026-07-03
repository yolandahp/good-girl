"use client";

import { useState, useTransition } from "react";

import { editTask } from "@/app/tasks/actions";
import { type TaskView } from "@/app/tasks/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function EditTaskForm({
  task,
  onDone,
}: {
  task: TaskView;
  onDone: () => void;
}) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await editTask(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-3 px-4 py-3.5">
      <input type="hidden" name="taskId" value={task.id} />
      <Input name="title" defaultValue={task.title} required autoFocus />
      <div className="flex gap-3">
        <Input
          name="points"
          type="number"
          min={1}
          defaultValue={task.points}
          required
          aria-label="Points"
          className="w-28 font-mono"
        />
        <Select
          name="type"
          defaultValue={task.type}
          aria-label="Task type"
          className="flex-1"
        >
          <option value="repeatable">Repeatable</option>
          <option value="oneoff">One-off</option>
        </Select>
      </div>
      {error ? (
        <p className="text-sm font-medium text-coral">{error}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
