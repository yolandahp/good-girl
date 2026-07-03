"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="font-display text-xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-xs text-sm text-muted">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
