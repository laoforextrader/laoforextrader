// Sanity helpers for the broadcast system: read schedules + EA stats,
// upload generated images as assets, persist run state.

import { createClient } from "@sanity/client"
import type { BroadcastSchedule, BroadcastPeriod } from "./types"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f8cr9afb"
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET   || "production"

export const broadcastSanity = createClient({
  projectId,
  dataset,
  apiVersion: "2025-04-25",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

export async function listBroadcastSchedules(): Promise<BroadcastSchedule[]> {
  return broadcastSanity.fetch<BroadcastSchedule[]>(
    `*[_type == "broadcastSchedule"] | order(period asc, hour asc) {
      _id, key, title, enabled, template, period, hour, dayOfWeek, dayOfMonth,
      lastRunAt, lastStatus, notes
    }`
  )
}

export async function getBroadcastScheduleByKey(key: string): Promise<BroadcastSchedule | null> {
  return broadcastSanity.fetch<BroadcastSchedule | null>(
    `*[_type == "broadcastSchedule" && key == $key][0] {
      _id, key, title, enabled, template, period, hour, dayOfWeek, dayOfMonth,
      lastRunAt, lastStatus, notes
    }`,
    { key }
  )
}

export async function markBroadcastRun(scheduleId: string, status: string): Promise<void> {
  await broadcastSanity
    .patch(scheduleId)
    .set({
      lastRunAt: new Date().toISOString(),
      lastStatus: status.slice(0, 200),
    })
    .commit()
}

export interface EAStatsLite {
  eaId: string
  updateMode?: string
  profitTotalPct?: number
  monthlyReturns?: { month: string; profitPct: number }[]
  dailyReturns?: { date: string; profitPct: number }[]
}

export async function fetchEAStats(eaId: string): Promise<EAStatsLite | null> {
  const r = await broadcastSanity.fetch<EAStatsLite | null>(
    `*[_type == "eaStats" && eaId == $eaId][0] {
      eaId, updateMode, profitTotalPct,
      monthlyReturns[] { month, profitPct },
      dailyReturns[] { date, profitPct }
    }`,
    { eaId }
  )
  if (!r || r.updateMode === "off") return null
  return r
}

export async function uploadBroadcastAsset(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const asset = await broadcastSanity.assets.upload("image", buffer, {
    filename,
    contentType,
  })
  return asset.url
}

// ─── Stats helpers ─────────────────────────────────────────────────────────

export function fmtPct(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toFixed(1)}%`
}

export function periodPctFor(
  s: EAStatsLite | null,
  period: BroadcastPeriod,
  fallback: string,
): string {
  if (period === "daily") {
    const d = s?.dailyReturns ?? []
    return fmtPct(d[d.length - 1]?.profitPct, fallback)
  }
  if (period === "weekly") {
    const d = s?.dailyReturns ?? []
    if (d.length === 0) return fallback
    const last7 = d.slice(-7)
    const sum = last7.reduce((acc, r) => acc + (r.profitPct ?? 0), 0)
    return fmtPct(sum, fallback)
  }
  // monthly
  const m = s?.monthlyReturns ?? []
  return fmtPct(m[m.length - 1]?.profitPct, fallback)
}

export function monthsSinceFirstReturn(s: EAStatsLite | null, fallback = 7): number {
  const monthStr = s?.monthlyReturns?.[0]?.month
  if (!monthStr) return fallback
  const m = monthStr.match(/^(\d{4})-(\d{1,2})$/)
  if (!m) return fallback
  const sy = parseInt(m[1], 10)
  const sm = parseInt(m[2], 10) - 1
  if (isNaN(sy) || isNaN(sm)) return fallback
  const now = new Date()
  const months = (now.getFullYear() - sy) * 12 + (now.getMonth() - sm) + 1
  return Math.max(1, months)
}
