"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/tasks", label: "Tasks" },
  { href: "/plan", label: "Plan" },
  { href: "/budgets", label: "Budgets" },
  { href: "/rewards", label: "Rewards" },
];

/**
 * Persistent app chrome for the signed-in pages: a sidebar on desktop and a
 * bottom nav on mobile, with the spendable balance always visible. Pages pass
 * their current balance and render their content as children.
 */
export function AppShell({
  balance,
  children,
}: {
  balance: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="md:flex md:min-h-screen">
      {/* Sidebar — desktop (sticks while the main content scrolls) */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:self-start md:overflow-y-auto md:border-r md:border-line md:px-6 md:py-8">
        <span className="mb-10 font-display text-lg font-bold tracking-tight">
          Be the Good Girl
        </span>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focusable rounded-lg px-3 py-2.5 font-display text-sm font-semibold transition",
                isActive(item.href)
                  ? "bg-ink text-paper"
                  : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-line pt-6">
          <SignOutButton />
        </div>
      </aside>

      <div className="w-full md:flex-1">
        {/* Header — mobile */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-5 backdrop-blur md:hidden">
          <span className="font-display font-bold tracking-tight">
            Be the Good Girl
          </span>
          <div className="font-mono text-sm">
            <span className="text-muted">bal</span>{" "}
            <span className="font-bold">{balance}</span>
          </div>
        </header>

        <main className="pb-24 md:pb-0">{children}</main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focusable flex flex-col items-center py-3 text-[11px] font-semibold uppercase tracking-wider transition",
              isActive(item.href) ? "text-ink" : "text-muted",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
