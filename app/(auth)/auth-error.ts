import type { AuthError } from "@supabase/supabase-js";

/**
 * Maps Supabase auth error codes to friendly, user-facing messages. Falls back
 * to the raw message for anything not explicitly handled.
 */
export function authErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Incorrect email or password.";
    case "user_already_exists":
    case "email_exists":
      return "That email is already registered. Try signing in instead.";
    case "weak_password":
      return "Password is too weak. Use at least 6 characters.";
    case "email_not_confirmed":
      return "Please confirm your email before signing in — check your inbox.";
    case "validation_failed":
      return "Please enter a valid email and password.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return error.message;
  }
}
