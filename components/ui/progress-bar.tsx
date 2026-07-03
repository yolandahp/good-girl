import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  max: number;
  /** Render the over-limit (coral) state. Defaults to `value > max`. */
  over?: boolean;
  /** Thinner track, for secondary pacing bars. */
  thin?: boolean;
  className?: string;
};

export function ProgressBar({
  value,
  max,
  over,
  thin,
  className,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const isOver = over ?? value > max;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-full bg-line",
        thin ? "h-1" : "h-1.5",
        className,
      )}
    >
      <div
        className={cn(
          "prog h-full rounded-full",
          isOver ? "bg-coral" : thin ? "bg-ink/40" : "bg-ink",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
