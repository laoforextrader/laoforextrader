// Self-hosted outbound-click counter.
//
// GA4 already receives these as events, but GA can only be read from the GA
// UI or the Data API (which needs a Google Cloud service account). /admin
// needs the numbers inline, so we also keep our own tally: one Sanity patch
// per click into a `clickStat` doc keyed by (target, Asia/Bangkok day).
//
// Deliberately fail-open and cheap:
//   - deterministic `_id` → createIfNotExists + inc, no read round-trip
//   - `visibility: "async"` → don't wait for the index to catch up
//   - every error is swallowed; a dead counter must never break a CTA click
//
// Called via navigator.sendBeacon (see lib/trackClick.ts), so the response
// body is never read by the browser.

import { NextResponse } from "next/server"
import { sanityWrite } from "@/lib/sanityWrite"
import { vientianeDay } from "@/lib/chat/quota"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Targets are authored by us, never by the visitor's free text — but this is a
// public unauthenticated endpoint, so bound it anyway: a loose `target` would
// let anyone mint unlimited Sanity documents.
const TARGET_RE = /^[a-z0-9][a-z0-9._-]{0,59}$/
const GROUPS = new Set(["broker", "ea", "contact", "other"])

export async function POST(req: Request) {
  try {
    // sendBeacon sends a Blob; both it and fetch() land here as JSON.
    const body = await req.json().catch(() => null)
    const target = typeof body?.target === "string" ? body.target.toLowerCase() : ""
    if (!TARGET_RE.test(target)) {
      return NextResponse.json({ error: "bad target" }, { status: 400 })
    }

    if (!process.env.SANITY_API_TOKEN) {
      // Not configured — behave like a no-op rather than a 500, so the click
      // still succeeds on a preview deploy without the write token.
      return NextResponse.json({ ok: false, skipped: "no token" })
    }

    const label = typeof body?.label === "string" ? body.label.slice(0, 80) : target
    const group = GROUPS.has(body?.group) ? body.group : "other"
    const day   = vientianeDay()
    const _id   = `clickStat.${target}.${day}`

    await sanityWrite
      .createIfNotExists({ _id, _type: "clickStat", target, label, group, day, count: 0 })
      .then(() =>
        sanityWrite
          .patch(_id)
          .set({ label, group, updatedAt: new Date().toISOString() })
          .inc({ count: 1 })
          .commit({ visibility: "async" }),
      )

    return NextResponse.json({ ok: true })
  } catch {
    // Never surface a failure — this endpoint is fire-and-forget.
    return NextResponse.json({ ok: false })
  }
}
