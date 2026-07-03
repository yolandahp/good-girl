import { type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "focusable rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink",
        className,
      )}
      {...props}
    />
  );
}
