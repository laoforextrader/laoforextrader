// Orchestrator for the "ea-summary" template:
//   1. Fetch live stats from Sanity (sgride + megihedge)
//   2. Build the Lao text caption
//   3. Send as a single text-only LINE broadcast
//
// All periods are text-only — no card images. Only weekly + monthly
// schedules are dispatched (daily is rejected by the dispatcher).
// Designed so we can swap data sources or add EAs without changing the
// dispatcher.
//
// WHAT THE PERCENTAGES MEAN. Every profitPct in an `eaStats` doc is
// `periodProfit / startBalance * 100`, where startBalance is the account's
// lifetime deposits (see BuildPayload in mql/EAStatsReporter.mq5). So
// SGride's "+24.7% in September" means September's profit equalled 24.7% of
// deposited capital — it is NOT the account's growth over that month. The
// caption states the capital base so the figure can't be read as a monthly
// rate of return.

import { broadcastLineMessages, lineConfigured, type LineMessage } from "./line"
import {
  fetchEAStats,
  fmtPct,
  periodPctFor,
  periodAmountFor,
  reportMonthKey,
  totalAmountFor,
  type EAStatsLite,
} from "./sanity"
import { capitalBase, fmtMoney, fmtMoneyPlain } from "../eaMoney"
import type { BroadcastPeriod, BroadcastResult } from "./types"

interface EAConfig {
  eaId: string
  name: string
  shortName: string
  icon: "rocket" | "zap"
  theme: "blue" | "purple"
  strategy: string
  risk: string
  fallbacks: { daily: string; weekly: string; monthly: string; total: string }
}

const EAS: EAConfig[] = [
  {
    eaId: "sgride",
    name: "TheRocket EA SGride",
    shortName: "SGride",
    icon: "rocket",
    theme: "blue",
    strategy: "Grid",
    risk: "Medium",
    fallbacks: { daily: "+2.4%", weekly: "+12.5%", monthly: "+18.7%", total: "+500%" },
  },
  {
    eaId: "megihedge",
    name: "TheRocket EA MegiHedge v2.0",
    shortName: "MegiHedge v2.0",
    icon: "zap",
    theme: "purple",
    strategy: "Hedging",
    risk: "Higher",
    fallbacks: { daily: "+3.1%", weekly: "+18.3%", monthly: "+22.4%", total: "+320%" },
  },
]

// MegiHedge v2.0 has not launched yet — show "Coming Soon" in broadcasts
// instead of live profit numbers. Flip to false when the EA goes live.
const MEGI_COMING_SOON = true

const EMOJI: Record<EAConfig["icon"], string> = { rocket: "🚀", zap: "⚡" }

function pad(n: number): string { return n < 10 ? `0${n}` : String(n) }
function ddmmyyyy(d: Date): string {
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}

/** "2026-09" → "09-2026", matching the DD-MM-YYYY style used elsewhere. */
function monthKeyToLabel(key: string): string {
  const [y, m] = key.split("-")
  return `${m}-${y}`
}

function dateLabel(period: BroadcastPeriod, now: Date): string {
  if (period === "daily") return ddmmyyyy(now)
  if (period === "weekly") {
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    return `${ddmmyyyy(start)} → ${ddmmyyyy(now)}`
  }
  // Monthly reports cover the month that just closed, resolved in Bangkok
  // time — the same key periodPctFor() reads, so label and number agree.
  return monthKeyToLabel(reportMonthKey(now))
}

function periodTitleLao(period: BroadcastPeriod): string {
  return period === "daily"   ? "ຜົນງານປະຈຳວັນ"
       : period === "weekly"  ? "ສະຫຼຸບປະຈຳອາທິດ"
                              : "ສະຫຼຸບປະຈຳເດືອນ"
}

/** The row label for the period's figure. Monthly names the actual month. */
function periodLabelLao(period: BroadcastPeriod, dateStr: string): string {
  return period === "daily"  ? "ມື້ນີ້"
       : period === "weekly" ? "ອາທິດນີ້"
                             : `ເດືອນ ${dateStr}`
}

interface EABlock {
  emoji: string
  shortName: string
  comingSoon: boolean
  periodPct: string
  periodAmount: string | null
  totalPct: string
  totalAmount: string | null
  /** Capital every % is measured against, e.g. "$2,000". */
  capital: string | null
}

function buildEABlock(
  cfg: EAConfig,
  stats: EAStatsLite | null,
  period: BroadcastPeriod,
  now: Date,
  comingSoon: boolean,
): EABlock {
  const amount = periodAmountFor(stats, period, now)
  const total  = totalAmountFor(stats)
  const base   = capitalBase(stats ?? {})
  return {
    emoji: EMOJI[cfg.icon],
    shortName: cfg.shortName,
    comingSoon,
    periodPct: periodPctFor(stats, period, cfg.fallbacks[period], now),
    periodAmount: amount ? fmtMoney(amount.amount, amount.currency) : null,
    totalPct: fmtPct(stats?.profitTotalPct, cfg.fallbacks.total),
    totalAmount: total ? fmtMoney(total.amount, total.currency) : null,
    capital: base ? fmtMoneyPlain(base.amount, base.currency, 0) : null,
  }
}

function buildText(period: BroadcastPeriod, dateStr: string, blocks: EABlock[]): string {
  const rowLabel = periodLabelLao(period, dateStr)

  const lines: string[] = [
    `📊 ${periodTitleLao(period)} TheRocket EA · ${dateStr}`,
  ]

  for (const b of blocks) {
    lines.push(``, `${b.emoji} ${b.shortName}`)
    if (b.comingSoon) {
      lines.push(`   🔜 ກຳລັງຈະເປີດໂຕ (Coming Soon)`)
      continue
    }
    lines.push(
      b.periodAmount
        ? `   ${rowLabel}: ${b.periodPct} (${b.periodAmount})`
        : `   ${rowLabel}: ${b.periodPct}`,
    )
    lines.push(
      b.totalAmount
        ? `   ລວມທັງໝົດ: ${b.totalPct} (${b.totalAmount})`
        : `   ລວມທັງໝົດ: ${b.totalPct}`,
    )
  }

  // Say what the percentages are a percentage OF. Without this the figures
  // read as monthly rates of return, which they are not.
  const bases = blocks
    .filter(b => !b.comingSoon && b.capital)
    .map(b => `${b.shortName} ${b.capital}`)
  if (bases.length > 0) {
    lines.push(``, `ℹ️ % ຄິດທຽບກັບທຶນເລີ່ມຕົ້ນ · ${bases.join(" · ")}`)
  }

  lines.push(``, `▶ ເບິ່ງລາຍລະອຽດ: https://www.laoforextrader.com/ea-system`)
  return lines.join("\n")
}

export interface RunOptions {
  period: BroadcastPeriod
  /** When false, skip the LINE call (still renders + uploads). Used by manual previews. */
  send?: boolean
  /** Override "now" for testing */
  now?: Date
}

export async function runEaSummaryBroadcast(opts: RunOptions): Promise<BroadcastResult & { textPreview: string }> {
  const { period } = opts
  const now = opts.now ?? new Date()
  const send = opts.send ?? true

  const dl = dateLabel(period, now)

  // Fetch stats for both EAs in parallel
  const [sgrideStats, megiStats] = await Promise.all([
    fetchEAStats("sgride"),
    fetchEAStats("megihedge"),
  ])

  const textPreview = buildText(period, dl, [
    buildEABlock(EAS[0], sgrideStats, period, now, false),
    buildEABlock(EAS[1], megiStats,   period, now, MEGI_COMING_SOON),
  ])

  // All broadcasts are text-only — no EA card images for any period.
  const imageUrls: string[] = []

  // Send to LINE
  if (!send) {
    return { key: `ea-${period}`, ok: true, status: "rendered (send=false)", imageUrls, textPreview }
  }
  if (!lineConfigured()) {
    return { key: `ea-${period}`, ok: true, status: "rendered, no LINE token", imageUrls, textPreview }
  }

  const messages: LineMessage[] = [
    { type: "text", text: textPreview },
  ]
  const r = await broadcastLineMessages(messages)
  if (!r.ok) {
    return {
      key: `ea-${period}`, ok: false,
      status: `line error ${r.status}`,
      imageUrls, textPreview,
      errorDetail: r.body?.slice(0, 500),
    }
  }
  return { key: `ea-${period}`, ok: true, status: "sent", imageUrls, textPreview }
}
