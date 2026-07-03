import { describe, expect, it } from "vitest";

import { addMonths, monthGrid, monthLabel } from "./calendar";

describe("monthGrid", () => {
  it("returns 42 days starting on the Monday on/before the 1st", () => {
    const grid = monthGrid("2026-07", "2026-07-03");
    expect(grid).toHaveLength(42);
    // July 2026: the 1st is a Wednesday, so the grid starts Mon Jun 29.
    expect(grid[0].date).toBe("2026-06-29");
    expect(grid[0].inMonth).toBe(false);
    expect(grid[41].date).toBe("2026-08-09");
  });

  it("flags days inside the target month and today", () => {
    const grid = monthGrid("2026-07", "2026-07-03");
    const jul3 = grid.find((d) => d.date === "2026-07-03")!;
    expect(jul3.inMonth).toBe(true);
    expect(jul3.isToday).toBe(true);
    expect(grid.find((d) => d.date === "2026-07-15")!.isToday).toBe(false);
  });
});

describe("monthLabel", () => {
  it("formats the month and year", () => {
    expect(monthLabel("2026-07")).toBe("July 2026");
  });
});

describe("addMonths", () => {
  it("moves forward and wraps the year", () => {
    expect(addMonths("2026-07", 1)).toBe("2026-08");
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });
});
