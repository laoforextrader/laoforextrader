// Broker-industry news → Lao summaries → Sanity.
//
// Modelled on /api/cron/daily-update, including the two things that pipeline
// had to learn the hard way:
//
//   · The write is in two stages. Stage 1 saves the raw feed and sets
//     pipelineComplete:false BEFORE calling Claude; stage 2 layers the Lao
//     summaries on and flips it true. When a Claude call overruns the wall,
//     Vercel hard-kills the invocation and the catch below never runs — so
//     without stage 1 there would be no doc at all and /broker would quietly
//     show last week's news as if it were today's.
//   · createIfNotExists + patch, never createOrReplace, so a retry cannot
//     wipe summaries an earlier run already produced.
//
// It cannot be a Vercel cron: the plan allows one per day and the daily
// market update holds that slot. Schedule it on cron-job.org against
//     /api/cron/broker-news?secret=<BROADCAST_SECRET or CRON_SECRET>
// Once a day is plenty — this wire moves in days, not minutes. A second hit a
// few hours later is a free safety net, because a run that finds
// pipelineComplete already true costs one Sanity read and returns.

import { NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { fetchBrokerNews, brokerNewsTier } from "@/lib/news/brokerSources"
import { namesOf } from "@/lib/brokerMentions"
import { summarizeBrokerNews } from "@/lib/news/summarizeBrokerNews"
import { todayInVientiane, fetchOgImage } from "@/lib/news/sources"
import { sendAdminTelegram, escapeHtml } from "@/lib/alertAdmin"
import { cronAuthorized } from "@/lib/cronAuth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// The Claude stage is ~40s at max_tokens 1400 (see summarizeBrokerNews for
// the arithmetic). 300 is the platform cap and leaves room for the feeds.
export const maxDuration = 300

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f8cr9afb",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

/**
 * Every name the site's own broker docs go by, for the news ordering: a story
 * about a broker we list comes before one about a broker we do not.
 *
 * Read from Sanity rather than listed in code, so adding a broker in Studio
 * moves its news up without a deploy. A failed read must not cost the day's
 * news — without the list the ordering is the plain newest-first it was
 * before, so the empty array is a real fallback and not an error.
 */
async function ourBrokerNames(): Promise<string[]> {
  try {
    const docs = await sanity.fetch<{ name?: string; slug?: string }[]>(
      `*[_type == "broker"]{ name, "slug": slug.current }`,
    )
    return Array.from(new Set((docs ?? []).flatMap((d) => namesOf(d))))
  } catch {
    return []
  }
}

async function handle(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const force = url.searchParams.get("force") === "true"
  const debug = url.searchParams.get("debug") === "true"

  const date = todayInVientiane()
  const docId = `broker-news-${date}`
  const t0 = Date.now()
  const timing: Record<string, number> = {}

  try {
    if (!force && !debug) {
      // Tokened client with useCdn:false → a strongly consistent read, so
      // this sees a write the primary run made minutes ago.
      const existing = await sanity.fetch<{ pipelineComplete?: boolean } | null>(
        `*[_id == $id][0]{ pipelineComplete }`,
        { id: docId },
      )
      if (existing?.pipelineComplete) {
        return NextResponse.json({ ok: true, skipped: "already-complete", date, docId })
      }
    }

    const tFetch = Date.now()
    const ours = await ourBrokerNames()
    const news = await fetchBrokerNews(20, ours)
    timing.fetchMs = Date.now() - tFetch

    if (debug) {
      return NextResponse.json({
        ok: true,
        debug: true,
        date,
        newsCount: news.length,
        ourBrokerNames: ours,
        // tier 0 = about a broker we list · 1 = this region's · 2 = the rest.
        // The list is already in that order; printing it is how a change to
        // the aliases gets checked without spending a Claude call.
        sample: news.slice(0, 10).map((n) => ({
          tier: brokerNewsTier(n, ours),
          title: n.title,
          source: n.sourceName,
        })),
        timing,
        totalMs: Date.now() - t0,
      })
    }

    if (news.length === 0) {
      // Both feeds down or everything filtered out. Leave whatever is already
      // published alone — an empty items[] would blank the section on /broker
      // for a problem that is upstream and usually over within the hour.
      await sendAdminTelegram(
        `⚠️ <b>Broker news</b>\nບໍ່ມີຂ່າວຜ່ານຕົວກັ່ນຕອງ (${escapeHtml(date)}) — ບໍ່ໄດ້ຂຽນທັບຂອງເກົ່າ`,
      )
      return NextResponse.json({ ok: false, reason: "no-items", date, timing })
    }

    // ── Stage 1: the raw wire, before spending anything on Claude ─────────
    const tRaw = Date.now()
    await sanity.createIfNotExists({ _id: docId, _type: "brokerNews", date })
    await sanity
      .patch(docId)
      .set({
        date,
        rawNews: news.slice(0, 20).map((n, i) => ({ _key: `raw-${i}`, ...n })),
        createdAt: new Date().toISOString(),
        pipelineComplete: false,
      })
      .unset(["lastError"])
      .commit()
    timing.rawSanityMs = Date.now() - tRaw

    // ── Stage 2: the Lao summaries ────────────────────────────────────────
    const tClaude = Date.now()
    const items = await summarizeBrokerNews(news, ours)
    timing.claudeMs = Date.now() - tClaude

    if (items.length === 0) {
      // Claude answered but kept nothing. Same reasoning as above: do not
      // publish an empty list over a good one.
      await sanity.patch(docId).set({ lastError: "summariser returned no items" }).commit()
      await sendAdminTelegram(
        `⚠️ <b>Broker news</b>\nສະຫຼຸບແລ້ວບໍ່ເຫຼືອຂ່າວໃດ (${escapeHtml(date)})`,
      )
      return NextResponse.json({ ok: false, reason: "no-summaries", date, timing })
    }

    // Cover images, for the survivors only. Twenty og:image fetches to
    // publish seven would be eighteen seconds of someone else's bandwidth for
    // nothing; these run in parallel and each one is allowed to fail.
    const tImg = Date.now()
    const withImages = await Promise.all(
      items.map(async (it) => ({ ...it, imageUrl: it.source ? await fetchOgImage(it.source) : "" })),
    )
    timing.imageMs = Date.now() - tImg

    await sanity
      .patch(docId)
      .set({
        items: withImages.map((it, i) => ({ _key: `bn-${i}`, ...it })),
        pipelineComplete: true,
      })
      .commit()

    return NextResponse.json({
      ok: true,
      date,
      docId,
      count: items.length,
      timing,
      totalMs: Date.now() - t0,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    // Best-effort: the doc may not exist if the failure was in the fetch.
    await sanity
      .patch(docId)
      .set({ lastError: msg.slice(0, 300) })
      .commit()
      .catch(() => {})
    await sendAdminTelegram(
      `🔴 <b>Broker news failed</b>\n${escapeHtml(date)}\n<code>${escapeHtml(msg.slice(0, 300))}</code>`,
    )
    return NextResponse.json({ ok: false, error: msg, date, timing }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
