import { twMerge } from "tailwind-merge";

export function cn(...parts: (string | undefined | null | false)[]) {
  return twMerge(parts.filter(Boolean) as string[]);
}
