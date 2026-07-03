"use client";

import { useState, useTransition } from "react";

import { deleteLogEntry, editLogEntry } from "@/app/budgets/actions";
import { type BudgetLogEntry } from "@/app/budgets/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAmount, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function EntryRow({ entry, unit }: { entry: BudgetLogEntry; unit: string }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(formData: FormData) {
    startTransition(async () => {
      await editLogEntry(formData);
      setEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("logId", entry.id);
      await deleteLogEntry(formData);
    });
  }

  if (editing) {
    return (
      <form action={save} className="flex flex-wrap items-center gap-2 py-1.5">
        <input type="hidden" name="logId" value={entry.id} />
        <Input
          name="logDate"
          type="date"
          defaultValue={entry.logDate}
          aria-label="Date"
          className="w-auto font-mono"
        />
        <Input
          name="amount"
          type="number"
          min={0}
          step="any"
          defaultValue={entry.amount}
          aria-label="Amount"
          autoFocus
          className="min-w-24 flex-1 font-mono"
        />
        <Button type="submit" size="sm" disabled={pending}>
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setEditing(false)}
        >
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <span className="w-14 shrink-0 font-mono text-xs text-muted">
        {formatShortDate(entry.logDate)}
      </span>
      <span className="flex-1 font-mono">{formatAmount(unit, entry.amount)}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="focusable text-xs font-medium text-muted hover:text-ink"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        aria-label="Delete entry"
        className="focusable text-muted hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}

/** Collapsible, editable list of the current period's log entries. */
export function LogEntryList({
  entries,
  unit,
}: {
  entries: BudgetLogEntry[];
  unit: string;
}) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  return (
    <div className="mt-4 border-t border-line pt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focusable flex w-full items-center justify-between py-1.5 text-xs font-medium text-muted hover:text-ink"
      >
        <span>
          {entries.length} {entries.length === 1 ? "entry" : "entries"} this
          period
        </span>
        <span className={cn("transition-transform", open && "rotate-180")}>
          ▾
        </span>
      </button>

      {open ? (
        <div className="divide-y divide-line">
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} unit={unit} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
