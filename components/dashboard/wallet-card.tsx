import { type WalletStats } from "@/lib/points/ledger";

/** The dark "statement" card: spendable balance plus this-week movement. */
export function WalletCard({ stats }: { stats: WalletStats }) {
  return (
    <div className="rounded-2xl bg-ink p-6 text-paper md:p-8">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-widest text-paper/50 uppercase">
          Spendable balance
        </p>
        <span className="font-mono text-xs text-paper/50">PTS</span>
      </div>

      <div className="mt-3 font-mono text-5xl font-bold tracking-tight md:text-6xl">
        {stats.balance}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-paper/10 text-center">
        <div className="bg-ink py-3">
          <p className="font-mono text-lg font-bold text-coral">
            {stats.earnedThisWeek >= 0 ? "+" : ""}
            {stats.earnedThisWeek}
          </p>
          <p className="mt-0.5 text-[11px] tracking-wider text-paper/50 uppercase">
            Earned wk
          </p>
        </div>
        <div className="bg-ink py-3">
          <p className="font-mono text-lg font-bold">{stats.spentThisWeek}</p>
          <p className="mt-0.5 text-[11px] tracking-wider text-paper/50 uppercase">
            Spent wk
          </p>
        </div>
      </div>
    </div>
  );
}
