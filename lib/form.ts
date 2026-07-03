import { z } from "zod";

/** Reads a uuid field from form data, or null if it's missing or malformed. */
export function uuidField(formData: FormData, name: string): string | null {
  const parsed = z.uuid().safeParse(formData.get(name));
  return parsed.success ? parsed.data : null;
}
