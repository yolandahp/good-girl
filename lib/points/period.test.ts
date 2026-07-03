import { describe, expect, it } from "vitest";

import { isPeriodClosed, periodBounds } from "./period";

describe("periodBounds", () => {
  it("daily is the single day", () => {
    expect(periodBounds("2026-07-03", "daily")).toEqual({
      start: "2026-07-03",
      end: "2026-07-03",
    });
  });

  it("weekly runs Monday to Sunday", () => {
    // 2026-07-03 is a Friday → week is Mon 06-29 .. Sun 07-05.
    expect(periodBounds("2026-07-03", "weekly")).toEqual({
      start: "2026-06-29",
      end: "2026-07-05",
    });
  });

  it("weekly on a Monday starts that day", () => {
    expect(periodBounds("2026-06-29", "weekly")).toEqual({
      start: "2026-06-29",
      end: "2026-07-05",
    });
  });

  it("weekly on a Sunday ends that day", () => {
    expect(periodBounds("2026-07-05", "weekly")).toEqual({
      start: "2026-06-29",
      end: "2026-07-05",
    });
  });

  it("monthly spans the 1st to the last day", () => {
    expect(periodBounds("2026-02-15", "monthly")).toEqual({
      start: "2026-02-01",
      end: "2026-02-28",
    });
  });
});

describe("isPeriodClosed", () => {
  it("is false for the current period", () => {
    expect(isPeriodClosed("2026-07-03", "weekly", "2026-07-03")).toBe(false);
  });

  it("is true once the period end is before today", () => {
    // week ending 07-05, today 07-06 → closed.
    expect(isPeriodClosed("2026-07-03", "weekly", "2026-07-06")).toBe(true);
  });

  it("is false while today is still inside the period", () => {
    expect(isPeriodClosed("2026-07-03", "weekly", "2026-07-05")).toBe(false);
  });
});
