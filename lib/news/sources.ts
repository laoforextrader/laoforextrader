// External data sources for the daily news/calendar pipeline.
// Kept out of the API route so the route stays small and testable.

import Parser from "rss-parser"
// Re-export shared client-safe helpers so server code can keep using
// the single import path.
export { formatLaoTime, formatDateDDMMYYYY } from "./sources-shared"

export interface CalendarEvent {
  event: string
  time: string         // ISO timestamp from Finnhub
  impact: "high" | "medium" | "low" | string
  forecast?: string
  previous?: string
  actual?: string
  country?: string
}

export interface NewsItem {
  title: string
  summary: string
  link: string
  pubDate: string
}

// Convert UTC date offset for Asia/Vientiane (UTC+7) and return YYYY-MM-DD
export function todayInVientiane(now = new Date()): string {
  const lao = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return lao.toISOString().split("T")[0]
}

export async function fetchEconomicCalendar(date: string): Promise<CalendarEvent[]> {
  const key = process.env.FINNHUB_API_KEY
  if (!key) return []
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/calendar/economic?from=${date}&to=${date}&token=${key}`,
      { cache: "no-store" },
    )
    if (!res.ok) return []
    const data: any = await res.json()
    const items: any[] = data?.economicCalendar ?? []
    return items.map(e => ({
      event: e.event ?? "",
      time: e.time ?? "",
      impact: (e.impact ?? "low").toLowerCase(),
      forecast: e.estimate?.toString() ?? "",
      previous: e.prev?.toString() ?? "",
      actual: e.actual?.toString() ?? "",
      country: e.country ?? "",
    }))
  } catch {
    return []
  }
}

export async function fetchForexNews(): Promise<NewsItem[]> {
  // Tight 4s per-feed timeout so a stuck source doesn't burn the whole
  // 60s function budget. Two feeds is enough — if both fail we just
  // run with no news and Claude still has the calendar to summarise.
  const feeds = [
    "https://www.fxstreet.com/rss/news",
    "https://www.forexlive.com/feed/news",
  ]
  const parser = new Parser({ timeout: 4000, headers: { "User-Agent": "Mozilla/5.0 LaoForexTrader/1.0" } })
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url)
      const items = (feed.items ?? []).slice(0, 8).map(item => ({
        title: (item.title ?? "").trim(),
        summary: (item.contentSnippet ?? item.content ?? "").trim().slice(0, 350),
        link: item.link ?? "",
        pubDate: item.pubDate ?? item.isoDate ?? "",
      })).filter(i => i.title)
      if (items.length > 0) return items
    } catch {
      // fall through to next feed
    }
  }
  return []
}
