import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { fetchEconomicCalendar, fetchForexNews, todayInVientiane } from "@/lib/news/sources"
import { summarizeDailyUpdate } from "@/lib/news/summarize"
import { broadcastLineMessages, lineConfigured } from "@/lib/broadcast/line"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

// Vercel cron entry: 0 23 * * * (= 06:00 Asia/Vientiane).
// Vercel attaches Authorization: Bearer <CRON_SECRET> automatically when
// it triggers the cron. Manual triggers can use the same header.

function authorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET || process.env.BROADCAST_SECRET
  if (!expected) return true // no secret configured, allow (dev)
  const got = req.headers.get("authorization")
  if (got === `Bearer ${expected}`) return true
  // also accept ?secret= for manual browser/curl testing
  const url = new URL(req.url)
  return url.searchParams.get("secret") === expected
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f8cr9afb",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   || "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function handle(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const url = new URL(req.url)
  const sendLine = url.searchParams.get("send") !== "false"

  const date = todayInVientiane()
  const docId = `daily-${date}`

  try {
    const [calendar, news] = await Promise.all([
      fetchEconomicCalendar(date),
      fetchForexNews(),
    ])

    const summary = await summarizeDailyUpdate({ date, calendar, news })

    await sanity.createOrReplace({
      _id: docId,
      _type: "dailyUpdate",
      date,
      dailySummary: summary.dailySummary,
      hotNews: {
        title:   summary.hotNews.title,
        summary: summary.hotNews.summary,
        source:  news[0]?.link ?? "",
      },
      calendarHighlights: summary.calendarHighlights.map((c, i) => ({
        _key: `cal-${i}`,
        name:        c.name,
        time:        c.time,
        impact:      c.impact,
        description: c.description,
      })),
      hasHighImpact: summary.hasHighImpact,
      lineMessage:   summary.lineMessage,
      rawCalendar: calendar
        .filter(e => e.impact === "high" || e.impact === "medium")
        .slice(0, 12)
        .map((e, i) => ({ _key: `raw-${i}`, ...e })),
      rawNews: news.slice(0, 6).map((n, i) => ({ _key: `n-${i}`, ...n })),
      createdAt: new Date().toISOString(),
      lastError: null,
    })

    let lineStatus: string = "skipped"
    if (sendLine && summary.hasHighImpact) {
      if (!lineConfigured()) {
        lineStatus = "no-line-token"
      } else {
        const lineText = `${summary.lineMessage}\n\n🔗 https://www.laoforextrader.com/news`
        const r = await broadcastLineMessages([{ type: "text", text: lineText }])
        lineStatus = r.ok ? "sent" : `error ${r.status}: ${(r.body || "").slice(0, 200)}`
      }
    } else if (!summary.hasHighImpact) {
      lineStatus = "no-high-impact"
    }

    return NextResponse.json({
      ok: true,
      date,
      docId,
      eventsCount: calendar.length,
      newsCount: news.length,
      hasHighImpact: summary.hasHighImpact,
      lineStatus,
      lineMessage: summary.lineMessage,
    })
  } catch (e: any) {
    const msg = (e?.message || String(e)).slice(0, 400)
    // Persist the error onto the day's doc so we can see it in Studio
    try {
      await sanity.createOrReplace({
        _id: docId,
        _type: "dailyUpdate",
        date,
        lastError: msg,
        createdAt: new Date().toISOString(),
      })
    } catch {}
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function GET(req: Request) { return handle(req) }
export async function POST(req: Request) { return handle(req) }
