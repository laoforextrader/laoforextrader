import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { fetchEconomicCalendar, fetchForexNews, todayInVientiane, type CalendarEvent } from "@/lib/news/sources"
import { summarizeDailyUpdate } from "@/lib/news/summarize"
import { broadcastLineMessages, lineConfigured } from "@/lib/broadcast/line"

// Major-pair currencies + gold (XAU). Country codes that map to these.
const MAJOR_COUNTRIES = new Set(["US", "EU", "GB", "UK", "JP", "CH", "AU", "CA", "NZ"])

function filterMajorEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events
    .filter(e => MAJOR_COUNTRIES.has((e.country || "").toUpperCase()))
    .filter(e => e.impact === "high" || e.impact === "medium" || e.impact === "low")
    .slice(0, 60)
}

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
  // Two flags both mean "don't push to LINE", whichever the operator
  // remembers. Save still happens so the /news page reflects the test.
  const sendLine = url.searchParams.get("send") !== "false"
                && url.searchParams.get("test") !== "true"
                && url.searchParams.get("dry") !== "true"
  const debug = url.searchParams.get("debug") === "true"

  const date = todayInVientiane()
  const docId = `daily-${date}`
  const t0 = Date.now()
  const timing: Record<string, number> = {}
  // A retry run (external safety-net scheduler) must not redo the ~45s Claude
  // work or re-push LINE when the morning run already succeeded. `force=true`
  // overrides for manual re-generation.
  const force = url.searchParams.get("force") === "true"

  try {
    if (!force && !debug) {
      // Tokened client + useCdn:false → strongly consistent read, so this
      // sees a write made minutes ago by the primary cron.
      const existing = await sanity.fetch<{ pipelineComplete?: boolean; lineSentAt?: string } | null>(
        `*[_id == $id][0]{ pipelineComplete, lineSentAt }`,
        { id: docId },
      )
      if (existing?.pipelineComplete) {
        return NextResponse.json({
          ok: true, skipped: "already-complete", date, docId,
          lineSentAt: existing.lineSentAt ?? null,
        })
      }
    }

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

    // ── Stage 1: persist the raw feeds BEFORE summarising ──────────────────
    // The Claude stage costs ~45s of the 60s budget; when it overruns, Vercel
    // hard-kills the invocation and even the catch block below never runs.
    // That used to leave no doc at all, so /news silently fell back to the
    // previous day. Writing the calendar first (it costs <1s to fetch) means a
    // Claude failure degrades to "table renders, summary missing" instead of
    // "yesterday's news".
    //
    // createIfNotExists + patch rather than createOrReplace, so a retry can't
    // wipe a summary an earlier run already produced.
    const tRaw = Date.now()
    await sanity.createIfNotExists({ _id: docId, _type: "dailyUpdate", date })
    await sanity.patch(docId).set({
      date,
      rawCalendar: filterMajorEvents(calendar).map((e, i) => ({ _key: `raw-${i}`, ...e })),
      rawNews:     news.slice(0, 8).map((n, i) => ({ _key: `n-${i}`, ...n })),
      createdAt: new Date().toISOString(),
      pipelineComplete: false,
    }).unset(["lastError"]).commit()
    timing.rawSanityMs = Date.now() - tRaw

    const tClaude = Date.now()
    const summary = await summarizeDailyUpdate({ date, calendar, news })
    timing.claudeMs = Date.now() - tClaude

    // Prefix slugs with date so detail-page URLs are stable across days.
    // Defensive: Haiku occasionally omits an optional array.
    const topEvents = (summary.topEvents ?? []).map((e, i) => ({
      _key: `te-${i}`,
      ...e,
      id: `${date}-${e.id ?? `event-${i}`}`,
    }))
    const hotNews = (summary.hotNews ?? []).map((n, i) => ({
      _key: `hn-${i}`,
      ...n,
      id: `${date}-${n.id ?? `news-${i}`}`,
    }))
    const calendarHighlights = (summary.calendarHighlights ?? []).map((c, i) => ({
      _key: `cal-${i}`,
      ...c,
    }))
    const technical = (summary.technical ?? []).map((t, i) => ({
      _key: `tech-${i}`,
      ...t,
    }))

    // ── Stage 2: layer the Lao summary on top of the raw doc ───────────────
    // Every summary field is set explicitly (empty arrays included) so a
    // re-run can't leave stale events behind from a previous run.
    const tSanity = Date.now()
    await sanity.patch(docId).set({
      dailySummary: summary.dailySummary ?? "",
      topEvents,
      hotNews,
      calendarHighlights,
      technical,
      hasHighImpact: !!summary.hasHighImpact,
      lineMessage:   summary.lineMessage ?? "",
      pipelineComplete: true,
    }).commit()
    timing.sanityMs = Date.now() - tSanity

    // LINE push is gated on tier-1 events only (isVeryHighImpact), not every
    // "high" tag — keeps us inside the LINE free-message quota. The /news page
    // and the saved doc still cover every day regardless.
    let lineStatus: string = "skipped"
    if (sendLine && summary.isVeryHighImpact) {
      if (!lineConfigured()) {
        lineStatus = "no-line-token"
      } else {
        const lineText = `${summary.lineMessage}\n\n🔗 https://www.laoforextrader.com/news`
        const r = await broadcastLineMessages([{ type: "text", text: lineText }])
        lineStatus = r.ok ? "sent" : `error ${r.status}: ${(r.body || "").slice(0, 200)}`
        // Stamped so a manual re-run can tell whether the quota was already
        // spent on this day before deciding to push again.
        if (r.ok) {
          await sanity.patch(docId).set({ lineSentAt: new Date().toISOString() }).commit().catch(() => {})
        }
      }
    } else if (!summary.isVeryHighImpact) {
      lineStatus = summary.hasHighImpact ? "high-impact-but-not-tier1" : "no-high-impact"
    }

    return NextResponse.json({
      ok: true,
      date,
      docId,
      eventsCount: calendar.length,
      newsCount: news.length,
      hasHighImpact: !!summary.hasHighImpact,
      isVeryHighImpact: !!summary.isVeryHighImpact,
      topEventsCount: topEvents.length,
      hotNewsCount: hotNews.length,
      technicalCount: technical.length,
      lineStatus,
      timing,
      totalMs: Date.now() - t0,
    })
  } catch (e: any) {
    const msg = (e?.message || String(e)).slice(0, 400)
    try {
      // patch, not createOrReplace — replacing here would delete the
      // rawCalendar that stage 1 just saved, which is the whole point of
      // writing it before the Claude call.
      await sanity.createIfNotExists({ _id: docId, _type: "dailyUpdate", date })
      await sanity.patch(docId).set({ lastError: msg }).commit()
    } catch {}
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function GET(req: Request) { return handle(req) }
export async function POST(req: Request) { return handle(req) }
