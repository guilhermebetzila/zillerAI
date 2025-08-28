import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes usando clsx e tailwind-merge.
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
