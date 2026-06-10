import { NextResponse } from "next/server"
import { getBroadcastScheduleByKey, markBroadcastRun } from "@/lib/broadcast/sanity"
import { runEaSummaryBroadcast } from "@/lib/broadcast/eaSummary"
import type { BroadcastPeriod } from "@/lib/broadcast/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

// Manual trigger — useful for testing without waiting for the cron window.
//
//   curl -X POST -H "Authorization: Bearer $BROADCAST_SECRET" \
//     "https://.../api/broadcast/run/ea-daily?send=true"
//
// ?send=false renders the image and returns the asset URLs without
// pushing to LINE — handy for previewing what would be sent.
// ?force=true bypasses the idempotency window (use only for manual reruns).

// Skip a real send if the same key fired recently — protects against
// cron-job.org retries or accidental duplicate jobs double-broadcasting.
const IDEMPOTENCY_WINDOW_MIN = 30

function authorized(req: Request): boolean {
  const secret = process.env.BROADCAST_SECRET
  if (!secret) return false // require explicit secret to avoid open trigger
  const got = req.headers.get("authorization")
  if (got === `Bearer ${secret}`) return true
  // also accept ?secret= for browser testing
  const url = new URL(req.url)
  return url.searchParams.get("secret") === secret
}

async function handle(req: Request, params: { key: string }) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const url = new URL(req.url)
  const send = url.searchParams.get("send") !== "false"
  const force = url.searchParams.get("force") === "true"

  const schedule = await getBroadcastScheduleByKey(params.key)
  if (!schedule) {
    return NextResponse.json({ error: `no schedule with key "${params.key}"` }, { status: 404 })
  }
  if (schedule.template !== "ea-summary") {
    return NextResponse.json({ error: `template "${schedule.template}" not supported` }, { status: 400 })
  }
  // Mirror the dispatcher: weekly + monthly only. Daily is retired, so even a
  // stale cron-job.org job pointed at /run/ea-daily can't push to LINE again.
  if (schedule.period === "daily") {
    return NextResponse.json({
      ok: false,
      key: schedule.key,
      status: "daily broadcasts are disabled (weekly + monthly only)",
    }, { status: 409 })
  }
  // Honor the enabled flag too — disabling a doc in Sanity now actually stops it.
  if (!schedule.enabled) {
    return NextResponse.json({
      ok: false,
      key: schedule.key,
      status: "schedule disabled",
    }, { status: 409 })
  }

  if (send && !force && schedule.lastRunAt) {
    const minsSince = (Date.now() - new Date(schedule.lastRunAt).getTime()) / 60000
    if (minsSince < IDEMPOTENCY_WINDOW_MIN) {
      return NextResponse.json({
        ok: true,
        key: schedule.key,
        status: `skipped — ran ${minsSince.toFixed(0)}m ago (idempotency window ${IDEMPOTENCY_WINDOW_MIN}m)`,
        skipped: true,
      })
    }
  }

  try {
    const result = await runEaSummaryBroadcast({
      period: schedule.period as BroadcastPeriod,
      send,
    })
    if (send) {
      await markBroadcastRun(schedule._id, `manual: ${result.status}`).catch(() => {})
    }
    return NextResponse.json({ ...result, key: schedule.key })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 },
    )
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ key: string }> }) {
  return handle(req, await ctx.params)
}
export async function GET(req: Request, ctx: { params: Promise<{ key: string }> }) {
  return handle(req, await ctx.params)
}
