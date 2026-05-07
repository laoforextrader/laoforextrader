import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { fetchEconomicCalendar, fetchForexNews, todayInVientiane } from "@/lib/news/sources"
import { summarizeDailyUpdate } from "@/lib/news/summarize"
import { broadcastLineMessages, lineConfigured } from "@/lib/broadcast/line"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function authorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET || process.env.BROADCAST_SECRET
  if (!expected) return true
  const got = req.headers.get("authorization")
  if (got === `Bearer ${expected}`) return true
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
  const debug = url.searchParams.get("debug") === "true"

  const date = todayInVientiane()
  const docId = `daily-${date}`
  const t0 = Date.now()
  const timing: Record<string, number> = {}

  try {
    const tFetch = Date.now()
    const [calendar, news] = await Promise.all([
      fetchEconomicCalendar(date),
      fetchForexNews(),
    ])
    timing.fetchMs = Date.now() - tFetch

    if (debug) {
      return NextResponse.json({
        ok: true,
        debug: true,
        date,
        eventsCount: calendar.length,
        newsCount: news.length,
        sampleNews: news.slice(0, 2).map(n => ({ title: n.title, link: n.link })),
        timing,
        totalMs: Date.now() - t0,
      })
    }

    const tClaude = Date.now()
    const summary = await summarizeDailyUpdate({ date, calendar, news })
    timing.claudeMs = Date.now() - tClaude

    // Prefix slugs with date so detail-page URLs are stable across days
    const topEvents = summary.topEvents.map((e, i) => ({
      _key: `te-${i}`,
      ...e,
      id: `${date}-${e.id}`,
    }))
    const hotNews = summary.hotNews.map((n, i) => ({
      _key: `hn-${i}`,
      ...n,
      id: `${date}-${n.id}`,
    }))

    const tSanity = Date.now()
    await sanity.createOrReplace({
      _id: docId,
      _type: "dailyUpdate",
      date,
      dailySummary: summary.dailySummary,
      topEvents,
      hotNews,
      calendarHighlights: summary.calendarHighlights.map((c, i) => ({
        _key: `cal-${i}`,
        ...c,
      })),
      technical: summary.technical.map((t, i) => ({
        _key: `tech-${i}`,
        ...t,
      })),
      hasHighImpact: summary.hasHighImpact,
      lineMessage:   summary.lineMessage,
      rawCalendar: calendar.slice(0, 80).map((e, i) => ({ _key: `raw-${i}`, ...e })),
      rawNews:     news.slice(0, 8).map((n, i) => ({ _key: `n-${i}`, ...n })),
      createdAt: new Date().toISOString(),
      lastError: null,
    })
    timing.sanityMs = Date.now() - tSanity

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
      topEventsCount: topEvents.length,
      hotNewsCount: hotNews.length,
      technicalCount: summary.technical.length,
      lineStatus,
      timing,
      totalMs: Date.now() - t0,
    })
  } catch (e: any) {
    const msg = (e?.message || String(e)).slice(0, 400)
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
