import { type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "focusable w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink",
        className,
      )}
      {...props}
    />
  );
}
