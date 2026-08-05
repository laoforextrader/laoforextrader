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
  imageUrl: string
}

// Convert UTC date offset for Asia/Vientiane (UTC+7) and return YYYY-MM-DD
export function todayInVientiane(now = new Date()): string {
  const lao = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return lao.toISOString().split("T")[0]
}

// Forex Factory weekly calendar JSON (free, no API key). Replaced Finnhub,
// whose calendar endpoint moved behind a paid plan (free keys get 403 →
// silent empty calendar → the tier-1 LINE gate never fired).
//
// The feed labels events by currency (USD/EUR/…) not country, and covers a
// US-time Sun–Sat week — a Vientiane "today" near the week boundary can fall
// in the next week's file, hence the two-feed fallback.
const FF_CALENDAR_URLS = [
  "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
  "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
]

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "US", EUR: "EU", GBP: "GB", JPY: "JP", CHF: "CH",
  AUD: "AU", CAD: "CA", NZD: "NZ", CNY: "CN",
}

export async function fetchEconomicCalendar(date: string): Promise<CalendarEvent[]> {
  for (const url of FF_CALENDAR_URLS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 LaoForexTrader/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const items: any = await res.json()
      if (!Array.isArray(items)) continue
      const events = items
        .filter((e: any) => e?.date && todayInVientiane(new Date(e.date)) === date)
        .map((e: any) => ({
          event: e.title ?? "",
          time: e.date ?? "",
          impact: (e.impact ?? "low").toLowerCase(), // High/Medium/Low/Holiday
          forecast: e.forecast?.toString() ?? "",
          previous: e.previous?.toString() ?? "",
          actual: "", // free feed carries no actuals; we run pre-release anyway
          country: CURRENCY_TO_COUNTRY[e.country] ?? e.country ?? "",
        }))
      if (events.length > 0) return events
    } catch {
      // fall through to the next-week feed
    }
  }
  return []
}

// Fetch the og:image (or twitter:image) from a news article URL.
// Most major outlets including FXStreet/ForexLive expose this meta tag
// even when their RSS feeds don't carry an image.
async function fetchOgImage(url: string): Promise<string> {
  if (!url) return ""
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 LaoForexTrader/1.0",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(3500),
    })
    if (!res.ok) return ""
    const html = await res.text()
    // Try og:image first, then twitter:image
    const og = html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i)
    if (og?.[1]) return og[1]
    const tw = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    if (tw?.[1]) return tw[1]
    // Sometimes content first, then property
    const og2 = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (og2?.[1]) return og2[1]
    return ""
  } catch {
    return ""
  }
}

// Extract the first usable image URL from an RSS item.
// Different feeds put images in different fields, so check the common ones.
function extractImage(item: any): string {
  // 1) media:content / media:thumbnail
  const mc = item["media:content"]
  if (mc) {
    if (Array.isArray(mc)) {
      for (const m of mc) {
        const u = m?.$?.url || m?.url
        if (u) return u
      }
    } else if (mc.$?.url) {
      return mc.$.url
    }
  }
  const mt = item["media:thumbnail"]
  if (mt?.$?.url) return mt.$.url
  // 2) enclosure (RSS 2.0)
  if (item.enclosure?.url && /^image\//.test(item.enclosure.type ?? "image/")) {
    return item.enclosure.url
  }
  // 3) <img src="..."> inside the content / description
  const html: string = item["content:encoded"] ?? item.content ?? item.description ?? ""
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (m?.[1]) return m[1]
  return ""
}

export async function fetchForexNews(): Promise<NewsItem[]> {
  // Tight 4s per-feed timeout so a stuck source doesn't burn the whole
  // 60s function budget. Two feeds is enough — if both fail we just
  // run with no news and Claude still has the calendar to summarise.
  const feeds = [
    "https://www.fxstreet.com/rss/news",
    "https://www.forexlive.com/feed/news",
  ]
  const parser = new Parser({
    timeout: 4000,
    headers: { "User-Agent": "Mozilla/5.0 LaoForexTrader/1.0" },
    customFields: {
      item: [
        ["media:content", "media:content", { keepArray: true }],
        ["media:thumbnail", "media:thumbnail"],
        ["content:encoded", "content:encoded"],
      ],
    },
  })
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url)
      const items = (feed.items ?? []).slice(0, 8).map(item => ({
        title: (item.title ?? "").trim(),
        summary: (item.contentSnippet ?? item.content ?? "").trim().slice(0, 350),
        link: item.link ?? "",
        pubDate: item.pubDate ?? item.isoDate ?? "",
        imageUrl: extractImage(item),
      })).filter(i => i.title)
      if (items.length === 0) continue
      // For the top 4 items (the ones Claude is likely to surface), fetch
      // the article's og:image in parallel so hot stories ship with a
      // hero image even when the RSS feed has no media tags.
      const topN = Math.min(4, items.length)
      const fetched = await Promise.all(
        items.slice(0, topN).map(async it => {
          if (it.imageUrl) return it
          const img = await fetchOgImage(it.link)
          return { ...it, imageUrl: img }
        }),
      )
      return [...fetched, ...items.slice(topN)]
    } catch {
      // fall through to next feed
    }
  }
  return []
}
