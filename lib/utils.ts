import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return format(new Date(date), "dd MMM yyyy")
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
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
    broker:     "text-blue-400",
    education:  "text-purple-400",
    news:       "text-green-400",
    analysis:   "text-gold",
    "ea-tools": "text-orange-400",
  }
  return map[cat] ?? "text-white/50"
}

// ── สำคัญ: map category → URL route ──
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

export function formatPrice(price: number, decimals = 4): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function slugify(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
}
