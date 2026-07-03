import { type WalletStats } from "@/lib/points/ledger";

/** The dark "statement" card: spendable balance as the hero, with this-week
 * movement stacked alongside. */
export function WalletCard({ stats }: { stats: WalletStats }) {
  return (
    <div className="rounded-2xl bg-ink p-6 text-paper md:p-7">
      <p className="text-xs tracking-widest text-paper/50 uppercase">
        Spendable balance
      </p>

      <div className="mt-3 flex items-end justify-between gap-6">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-5xl font-bold tracking-tight md:text-6xl">
            {stats.balance}
          </span>
          <span className="font-mono text-xs text-paper/40">PTS</span>
        </div>

        <div className="space-y-1.5 pb-1 text-right font-mono text-sm">
          <div>
            <span className="font-bold text-coral">
              {stats.earnedThisWeek >= 0 ? "+" : ""}
              {stats.earnedThisWeek}
            </span>
            <span className="ml-2 text-[11px] tracking-wider text-paper/40 uppercase">
              earned wk
            </span>
          </div>
          <div>
            <span className="font-bold">{stats.spentThisWeek}</span>
            <span className="ml-2 text-[11px] tracking-wider text-paper/40 uppercase">
              spent wk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
