"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { signIn } from "./actions";

export function SignInForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState(signIn, {
    error: initialError,
  });

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h1 className="font-display text-xl font-bold tracking-tight">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-muted">Sign in to keep your streak.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error ? (
          <p className="text-sm font-medium text-coral">{state.error}</p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-coral">
          Sign up
        </Link>
      </p>
    </div>
  );
}
