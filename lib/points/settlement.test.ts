import { describe, expect, it } from "vitest";

import { closedPeriodSummaries } from "./settlement";

const monthly = { period: "monthly" as const, periodLimit: "1000" };

describe("closedPeriodSummaries", () => {
  it("returns nothing when there are no logs", () => {
    expect(closedPeriodSummaries([], monthly, "2026-07-03")).toEqual([]);
  });

  it("pays out a closed period that stayed within the limit", () => {
    const logs = [
      { logDate: "2026-06-10", amount: "400" },
      { logDate: "2026-06-20", amount: "300" },
    ];
    const [summary] = closedPeriodSummaries(logs, monthly, "2026-07-03");
    expect(summary).toEqual({
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
      total: 700,
      withinLimit: true,
    });
  });

  it("marks a closed period over the limit as not within limit", () => {
    const logs = [
      { logDate: "2026-06-10", amount: "800" },
      { logDate: "2026-06-20", amount: "400" },
    ];
    const [summary] = closedPeriodSummaries(logs, monthly, "2026-07-03");
    expect(summary.total).toBe(1200);
    expect(summary.withinLimit).toBe(false);
  });

  it("excludes the current (still open) period", () => {
    const logs = [
      { logDate: "2026-06-15", amount: "500" }, // closed June
      { logDate: "2026-07-02", amount: "200" }, // open July
    ];
    const summaries = closedPeriodSummaries(logs, monthly, "2026-07-03");
    expect(summaries).toHaveLength(1);
    expect(summaries[0].periodStart).toBe("2026-06-01");
  });

  it("treats a total exactly at the limit as within limit", () => {
    const logs = [{ logDate: "2026-06-15", amount: "1000" }];
    const [summary] = closedPeriodSummaries(logs, monthly, "2026-07-03");
    expect(summary.withinLimit).toBe(true);
  });
});
