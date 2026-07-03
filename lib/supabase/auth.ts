import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "./server";

/**
 * Resolves the currently authenticated user on the server, or `null` if there
 * is no valid session. Use when a page can render for both signed-in and
 * signed-out visitors.
 */
export async function getOptionalUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Resolves the currently authenticated user, redirecting to `/sign-in` if
 * there is no session. Use at the top of any protected page or action so the
 * rest of the code can trust `user.id` — the client is never trusted for it.
 */
export async function getCurrentUser(): Promise<User> {
  const user = await getOptionalUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}
