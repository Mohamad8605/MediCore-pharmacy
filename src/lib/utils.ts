import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge
 * so later classes override earlier ones correctly at runtime.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
