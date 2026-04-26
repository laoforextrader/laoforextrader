import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  try {
    return format(new Date(date), "dd MMM yyyy")
  } catch {
    return date
  }
}

export function timeAgo(date: string) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return date
  }
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    broker:     "● ລີວິວ Broker",
    education:  "● ການສຶກສາ",
    news:       "● ຂ່າວ",
    analysis:   "● ວິເຄາະ",
    "ea-tools": "● EA & Tools",
  }
  return map[cat] ?? cat
}

export function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    broker:     "text-blue-600",
    education:  "text-purple-600",
    news:       "text-green-600",
    analysis:   "text-amber-600",
    "ea-tools": "text-pink-600",
  }
  return map[cat] ?? "text-gray-500"
}

export function categoryRoute(cat: string): string {
  const map: Record<string, string> = {
    broker:     "broker",
    education:  "education",
    news:       "news",
    analysis:   "analysis",
    "ea-tools": "ea-tools",
  }
  return map[cat] ?? cat
}

export function slugify(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
}


export function formatPrice(price: number, decimals?: number): string {
  if (decimals !== undefined) return price.toFixed(decimals)
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 10)   return price.toFixed(4)
  return price.toFixed(5)
}
