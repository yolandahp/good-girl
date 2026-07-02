import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-muted">
        Signed in as <span className="text-ink">{user.email}</span>
      </p>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
