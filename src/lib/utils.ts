import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind CSS class names, with later classes overriding earlier ones for the same property. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
