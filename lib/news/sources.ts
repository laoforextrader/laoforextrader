// External data sources for the daily news/calendar pipeline.
// Kept out of the API route so the route stays small and testable.

import Parser from "rss-parser"

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

// Format ISO timestamp as HH:MM in Lao local time
export function formatLaoTime(iso: string | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const lao = new Date(d.getTime() + 7 * 60 * 60 * 1000)
  const h = String(lao.getUTCHours()).padStart(2, "0")
  const m = String(lao.getUTCMinutes()).padStart(2, "0")
  return `${h}:${m}`
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
  // Try several feeds — Investing/FXStreet/Reuters — first one that responds
  // wins. RSS feeds occasionally rate limit, so fallbacks reduce flakiness.
  const feeds = [
    "https://www.fxstreet.com/rss/news",
    "https://www.investing.com/rss/news_25.rss",
    "https://www.forexlive.com/feed/news",
  ]
  const parser = new Parser({ timeout: 8000, headers: { "User-Agent": "Mozilla/5.0 LaoForexTrader/1.0" } })
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url)
      const items = (feed.items ?? []).slice(0, 8).map(item => ({
        title: (item.title ?? "").trim(),
        summary: (item.contentSnippet ?? item.content ?? "").trim().slice(0, 400),
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
