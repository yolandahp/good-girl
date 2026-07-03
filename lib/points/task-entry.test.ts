import { describe, expect, it } from "vitest";

import { taskCompletionEntry } from "./task-entry";

const base = {
  id: "task-1",
  userId: "user-1",
  points: 25,
  title: "Build & deploy app A",
} as const;

describe("taskCompletionEntry", () => {
  it("credits the task's points from the 'task' source", () => {
    const entry = taskCompletionEntry({ ...base, type: "repeatable" });
    expect(entry.delta).toBe(25);
    expect(entry.source).toBe("task");
    expect(entry.userId).toBe("user-1");
  });

  it("sets ref_id to the task id for one-off tasks (blocks double-award)", () => {
    const entry = taskCompletionEntry({ ...base, type: "oneoff" });
    expect(entry.refId).toBe("task-1");
  });

  it("leaves ref_id null for repeatable tasks (allows repeats)", () => {
    const entry = taskCompletionEntry({ ...base, type: "repeatable" });
    expect(entry.refId).toBeNull();
  });
});
