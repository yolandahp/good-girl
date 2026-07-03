import { redirect } from "next/navigation";

export default function Home() {
  // Authenticated users land here from "/"; the proxy sends signed-out
  // visitors to /sign-in before this runs.
  redirect("/dashboard");
}
