import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="font-display text-xl font-bold tracking-tight">
        Page not found
      </h1>
      <p className="max-w-xs text-sm text-muted">
        That page doesn&apos;t exist.
      </p>
      <Link href="/dashboard" className="font-medium text-coral">
        Back to dashboard
      </Link>
    </div>
  );
}
