import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names and resolves conflicting Tailwind utilities so the last one
 * wins (e.g. a caller's `w-24` overrides the `w-full` baked into a primitive).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
