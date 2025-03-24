import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to combine class names conditionally and merge conflicting Tailwind CSS classes.
 * 
 * @param inputs - A list of class names or conditions that determine which classes should be applied.
 * @returns A string of merged and conditionally applied class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}