import { describe, expect, it } from "vitest";

import { deriveBalance } from "./balance";

describe("deriveBalance", () => {
  it("is 0 for an empty ledger", () => {
    expect(deriveBalance([])).toBe(0);
  });

  it("sums positive deltas (earns)", () => {
    expect(deriveBalance([{ delta: 25 }, { delta: 10 }, { delta: 8 }])).toBe(43);
  });

  it("nets earns and redemptions", () => {
    expect(deriveBalance([{ delta: 100 }, { delta: -30 }, { delta: -20 }])).toBe(
      50,
    );
  });

  it("can go negative if redemptions exceed earns", () => {
    expect(deriveBalance([{ delta: 10 }, { delta: -25 }])).toBe(-15);
  });
});
