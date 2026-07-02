import { SignInForm } from "./sign-in-form";

/** Messages for error flags passed via the URL (e.g. from the auth callback). */
const URL_ERRORS: Record<string, string> = {
  confirmation_failed:
    "That confirmation link is invalid or has expired. Try signing in, or sign up again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError = error ? URL_ERRORS[error] : undefined;

  return <SignInForm initialError={initialError} />;
}
