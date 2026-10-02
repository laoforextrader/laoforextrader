// Sanity helpers for the broadcast system: read schedules + EA stats,
// upload generated images as assets, persist run state.

import { createClient } from "@sanity/client"
import { capitalBase, toRealMoney, type Money } from "../eaMoney"
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
  profitTotal?: number
  profitTotalPct?: number
  balance?: number
  startBalance?: number
  totalDeposits?: number
  currency?: string
  monthlyReturns?: { month: string; profitPct: number }[]
  dailyReturns?: { date: string; profitPct: number }[]
}

export async function fetchEAStats(eaId: string): Promise<EAStatsLite | null> {
  const r = await broadcastSanity.fetch<EAStatsLite | null>(
    `*[_type == "eaStats" && eaId == $eaId][0] {
      eaId, updateMode, profitTotal, profitTotalPct,
      balance, startBalance, totalDeposits, currency,
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

/**
 * The calendar month a monthly report covers: the previous month in Bangkok
 * time — the last month that actually closed.
 *
 * The `ea-monthly` schedule fires on the 1st at 21:00 Bangkok, so by the
 * time the report runs "now" is already inside the NEW month. This used to
 * read `monthlyReturns[length - 1]`, and BuildPayload() always fills that
 * last slot with the *current* month, so the monthly summary reported a
 * one-day-old month as though it were a full one: September's +24.69% went
 * out as October's +1.3%. Resolving the key explicitly fixes that, and the
 * caption label is derived from the same key so the two cannot disagree.
 */
export function reportMonthKey(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now)
  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value ?? "", 10)
  const year = get("year")
  const month = get("month")
  const m = month === 1 ? 12 : month - 1
  const y = month === 1 ? year - 1 : year
  return `${y}-${String(m).padStart(2, "0")}`
}

// undefined = no live data at all (caller shows its placeholder)
// null      = live data, but the reported month is missing or unusable
//             (caller must NOT substitute a placeholder — that would
//              publish a made-up number as a real result)
function monthlyPct(s: EAStatsLite | null, now: Date): number | null | undefined {
  const m = s?.monthlyReturns ?? []
  if (m.length === 0) return undefined
  const hit = m.find(r => r.month === reportMonthKey(now))
  if (!hit) return null
  return typeof hit.profitPct === "number" && !isNaN(hit.profitPct) ? hit.profitPct : null
}

export function periodPctFor(
  s: EAStatsLite | null,
  period: BroadcastPeriod,
  fallback: string,
  now: Date = new Date(),
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
  const v = monthlyPct(s, now)
  if (v === undefined) return fallback
  if (v === null) return "—"
  return fmtPct(v, fallback)
}

/** Raw period percentage as a number (for further math). */
export function periodPctNumber(
  s: EAStatsLite | null,
  period: BroadcastPeriod,
  now: Date = new Date(),
): number | null {
  if (!s) return null
  if (period === "daily") {
    const d = s.dailyReturns ?? []
    const v = d[d.length - 1]?.profitPct
    return typeof v === "number" && !isNaN(v) ? v : null
  }
  if (period === "weekly") {
    const d = s.dailyReturns ?? []
    if (d.length === 0) return null
    return d.slice(-7).reduce((acc, r) => acc + (r.profitPct ?? 0), 0)
  }
  return monthlyPct(s, now) ?? null
}

/**
 * The period's profit as money, in the account's real currency.
 *
 * Every profitPct the EA sends is `periodProfit / startBalance * 100`, so
 * the money figure is an exact multiplication — nothing has to be guessed.
 * This used to back-derive it from the current balance instead:
 *
 *     amount = balance * pct / (100 + pct)
 *
 * which silently assumed pct was a return on the period's OPENING balance.
 * On SGride — $2,000 deposited, $9,000 withdrawn, $6,345 balance — that
 * overstated every figure by 2.5-3x: September went out as $1,256.39
 * against an actual $493.80.
 */
export function periodAmountFor(
  s: EAStatsLite | null,
  period: BroadcastPeriod,
  now: Date = new Date(),
): Money | null {
  if (!s) return null
  const base = capitalBase(s)
  if (!base) return null
  const pct = periodPctNumber(s, period, now)
  if (pct === null) return null
  return { amount: (base.amount * pct) / 100, currency: base.currency }
}

/** Lifetime profit as money, in the account's real currency. */
export function totalAmountFor(s: EAStatsLite | null): Money | null {
  if (typeof s?.profitTotal !== "number" || isNaN(s.profitTotal)) return null
  return toRealMoney(s.profitTotal, s.currency)
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
