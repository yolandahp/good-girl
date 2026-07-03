import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Small uppercase label, e.g. a task type or budget period. */
export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-[11px] tracking-wider text-muted uppercase",
        className,
      )}
      {...props}
    />
  );
}
