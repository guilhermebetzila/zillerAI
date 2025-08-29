import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes usando clsx e tailwind-merge.
 *
 * Exemplo:
 * cn("px-4 py-2", isActive && "bg-green-500")
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
