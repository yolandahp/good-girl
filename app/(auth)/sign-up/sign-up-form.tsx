"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUp, type SignUpState } from "./actions";

const initialState: SignUpState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h1 className="font-display text-xl font-bold tracking-tight">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-muted">
        Start turning habits into points.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="focusable w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="focusable w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </div>

        {state.error ? (
          <p className="text-sm font-medium text-coral">{state.error}</p>
        ) : null}
        {state.message ? (
          <p className="text-sm font-medium text-ink">{state.message}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="focusable w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-coral">
          Sign in
        </Link>
      </p>
    </div>
  );
}
