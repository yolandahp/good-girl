import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

/** Auth pages a signed-in visitor should be bounced away from. */
const AUTH_PAGES = ["/sign-in", "/sign-up"];

/** Paths a signed-out visitor is allowed to reach (auth pages + the email
 * confirmation callback, which must run before a session exists). */
const PUBLIC_PATHS = [...AUTH_PAGES, "/auth/callback"];

/** Copies auth cookies from one response onto a fresh redirect response. */
function redirectPreservingCookies(
  request: NextRequest,
  pathname: string,
  from: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

/**
 * Refreshes the Supabase auth session on every request, keeps the auth cookies
 * in sync between request and response, and enforces route access:
 * - signed-out visitors are sent to `/sign-in` (except on public paths)
 * - signed-in visitors are sent to `/dashboard` if they hit an auth page
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: refreshes the session. Do not run code between creating the
  // client and this call, or you risk random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    return redirectPreservingCookies(request, "/sign-in", supabaseResponse);
  }

  if (user && AUTH_PAGES.includes(pathname)) {
    return redirectPreservingCookies(request, "/dashboard", supabaseResponse);
  }

  return supabaseResponse;
}
