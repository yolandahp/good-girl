import { describe, expect, it } from "vitest";

import { checkRedeemable } from "./redeem";

const reward = { cost: 100, redeemedAt: null };

describe("checkRedeemable", () => {
  it("allows redemption when the balance covers the cost", () => {
    expect(checkRedeemable(100, reward)).toEqual({ ok: true });
    expect(checkRedeemable(250, reward)).toEqual({ ok: true });
  });

  it("rejects when the balance is short, reporting how much is missing", () => {
    expect(checkRedeemable(70, reward)).toEqual({
      ok: false,
      reason: "Not enough points — 30 to go.",
    });
  });

  it("rejects an already-redeemed reward", () => {
    expect(
      checkRedeemable(1000, { cost: 100, redeemedAt: new Date() }),
    ).toEqual({ ok: false, reason: "Already redeemed." });
  });
});
