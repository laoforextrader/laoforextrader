// Decide which schedules should fire right now and dispatch them.
// Times in Sanity are local Asia/Vientiane (UTC+7).

import type { BroadcastSchedule, BroadcastResult } from "./types"
import { listBroadcastSchedules, markBroadcastRun } from "./sanity"
import { runEaSummaryBroadcast } from "./eaSummary"

const ASIA_VIENTIANE_OFFSET_MS = 7 * 60 * 60 * 1000
const IDEMPOTENCY_WINDOW_MIN = 50

interface LocalTime {
  hour: number
  dayOfWeek: number   // 0=Sun, 6=Sat
  dayOfMonth: number  // 1-31
}

function toLocalTime(nowUTC: Date): LocalTime {
  const local = new Date(nowUTC.getTime() + ASIA_VIENTIANE_OFFSET_MS)
  return {
    hour: local.getUTCHours(),
    dayOfWeek: local.getUTCDay(),
    dayOfMonth: local.getUTCDate(),
  }
}

export function shouldFire(s: BroadcastSchedule, nowUTC: Date): { fire: boolean; reason: string } {
  if (!s.enabled) return { fire: false, reason: "disabled" }
  const local = toLocalTime(nowUTC)
  if (s.hour !== local.hour) return { fire: false, reason: `hour mismatch (now ${local.hour}, want ${s.hour})` }

  if (s.period === "weekly") {
    if (s.dayOfWeek === undefined) return { fire: false, reason: "weekly without dayOfWeek" }
    if (s.dayOfWeek !== local.dayOfWeek) return { fire: false, reason: `dow mismatch` }
  }
  if (s.period === "monthly") {
    if (s.dayOfMonth === undefined) return { fire: false, reason: "monthly without dayOfMonth" }
    if (s.dayOfMonth !== local.dayOfMonth) return { fire: false, reason: `dom mismatch` }
  }

  // Idempotency — don't double-fire if we already ran this hour
  if (s.lastRunAt) {
    const last = new Date(s.lastRunAt).getTime()
    const minsSince = (nowUTC.getTime() - last) / 60000
    if (minsSince < IDEMPOTENCY_WINDOW_MIN) {
      return { fire: false, reason: `ran ${minsSince.toFixed(0)}m ago` }
    }
  }
  return { fire: true, reason: "match" }
}

async function dispatchOne(s: BroadcastSchedule): Promise<BroadcastResult> {
  if (s.template !== "ea-summary") {
    return { key: s.key, ok: false, status: `unknown template ${s.template}` }
  }
  if (s.period !== "daily" && s.period !== "weekly" && s.period !== "monthly") {
    return { key: s.key, ok: false, status: `unknown period ${s.period}` }
  }
  try {
    const r = await runEaSummaryBroadcast({ period: s.period, send: true })
    await markBroadcastRun(s._id, r.status).catch(() => {})
    return { key: s.key, ok: r.ok, status: r.status, imageUrls: r.imageUrls, errorDetail: r.errorDetail }
  } catch (e: any) {
    const msg = `error: ${(e?.message ?? String(e)).slice(0, 180)}`
    await markBroadcastRun(s._id, msg).catch(() => {})
    return { key: s.key, ok: false, status: msg }
  }
}

export interface DispatchSummary {
  evaluated: number
  fired: number
  results: BroadcastResult[]
  skipped: { key: string; reason: string }[]
}

export async function dispatchDueBroadcasts(nowUTC: Date = new Date()): Promise<DispatchSummary> {
  const schedules = await listBroadcastSchedules()
  const results: BroadcastResult[] = []
  const skipped: { key: string; reason: string }[] = []

  for (const s of schedules) {
    const decision = shouldFire(s, nowUTC)
    if (!decision.fire) {
      skipped.push({ key: s.key, reason: decision.reason })
      continue
    }
    const r = await dispatchOne(s)
    results.push(r)
  }

  return {
    evaluated: schedules.length,
    fired: results.length,
    results,
    skipped,
  }
}
