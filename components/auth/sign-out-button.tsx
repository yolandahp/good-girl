import { signOut } from "@/app/(auth)/actions";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={
          className ??
          "focusable text-sm font-medium text-muted transition hover:text-ink"
        }
      >
        Sign out
      </button>
    </form>
  );
}
