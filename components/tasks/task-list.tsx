"use client";

import { useState } from "react";

import { type TaskView } from "@/app/tasks/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

import { TaskListView } from "./task-list-view";

const FILTERS = [
  ["all", "All"],
  ["repeatable", "Repeatable"],
  ["oneoff", "One-off"],
] as const;

type Filter = (typeof FILTERS)[number][0];

const PAGE_SIZE = 8;

export function TaskList({ tasks }: { tasks: TaskView[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task to start earning points."
      />
    );
  }

  const shown = tasks.filter((t) => filter === "all" || t.type === filter);
  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageTasks = shown.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-1 text-sm">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setPage(1);
            }}
            className={cn(
              "focusable rounded-full px-3 py-1 font-medium transition",
              filter === key ? "bg-ink text-paper" : "text-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="px-1 py-6 text-center text-sm text-muted">
          No {filter} tasks.
        </p>
      ) : (
        <>
          {/* Reserve room for a full page so the pager doesn't jump on short pages. */}
          <div className="min-h-[33rem]">
            <TaskListView key={`${filter}-${currentPage}`} tasks={pageTasks} />
          </div>

          {totalPages > 1 ? (
            <div className="flex justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={cn(
                    "focusable h-8 w-8 rounded-lg font-mono text-sm transition",
                    n === currentPage
                      ? "bg-ink text-paper"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
