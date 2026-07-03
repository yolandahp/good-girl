"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type ToastContextValue = { toast: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

/** Lightweight, single-slot toast: shows a message briefly then fades out. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 font-mono text-sm font-semibold text-paper transition-all md:bottom-8",
          message ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}
