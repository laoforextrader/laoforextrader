// Orchestrator for the "ea-summary" template:
//   1. Fetch live stats from Sanity (sgride + megihedge)
//   2. Build the Lao text caption
//   3. Send as a single text-only LINE broadcast
//
// All periods are text-only — no card images. Only weekly + monthly
// schedules are dispatched (daily is rejected by the dispatcher).
// Designed so we can swap data sources or add EAs without changing the
// dispatcher.

import { broadcastLineMessages, lineConfigured, type LineMessage } from "./line"
import {
  fetchEAStats,
  fmtPct,
  fmtMoney,
  periodPctFor,
  periodAmountFor,
} from "./sanity"
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
    name: "TheRocket EA MegiHedge",
    shortName: "MegiHedge",
    icon: "zap",
    theme: "purple",
    strategy: "Hedging",
    risk: "Higher",
    fallbacks: { daily: "+3.1%", weekly: "+18.3%", monthly: "+22.4%", total: "+320%" },
  },
]

function pad(n: number): string { return n < 10 ? `0${n}` : String(n) }
function ddmmyyyy(d: Date): string {
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}
function mmyyyy(d: Date): string {
  return `${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}

function dateLabel(period: BroadcastPeriod, now: Date): string {
  if (period === "daily") return ddmmyyyy(now)
  if (period === "weekly") {
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    return `${ddmmyyyy(start)} → ${ddmmyyyy(now)}`
  }
  return mmyyyy(now)
}

function periodTitleLao(period: BroadcastPeriod): string {
  return period === "daily"   ? "ຜົນງານປະຈຳວັນ"
       : period === "weekly"  ? "ສະຫຼຸບປະຈຳອາທິດ"
                              : "ສະຫຼຸບປະຈຳເດືອນ"
}

function periodLabelLao(period: BroadcastPeriod): string {
  return period === "daily" ? "ມື້ນີ້" : period === "weekly" ? "ອາທິດນີ້" : "ເດືອນນີ້"
}

function buildText(
  period: BroadcastPeriod,
  dateStr: string,
  sgridePct: string, sgrideTotal: string, sgrideAmount: string | null,
  megiPct: string, megiTotal: string, megiAmount: string | null,
): string {
  const periodLabel = periodLabelLao(period)
  const title = periodTitleLao(period)
  const sgrideLine = sgrideAmount
    ? `   ${periodLabel}: ${sgridePct} (${sgrideAmount})`
    : `   ${periodLabel}: ${sgridePct}`
  const megiLine = megiAmount
    ? `   ${periodLabel}: ${megiPct} (${megiAmount})`
    : `   ${periodLabel}: ${megiPct}`
  return [
    `📊 ${title} TheRocket EA · ${dateStr}`,
    ``,
    `🚀 SGride`,
    sgrideLine,
    `   ລວມ: ${sgrideTotal}`,
    ``,
    `⚡ MegiHedge`,
    megiLine,
    `   ລວມ: ${megiTotal}`,
    ``,
    `▶ ເບິ່ງລາຍລະອຽດ: https://www.laoforextrader.com/ea-system`,
  ].join("\n")
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

  // Build text inputs first
  const sgrideCfg = EAS[0]
  const megiCfg   = EAS[1]
  const sgridePeriod = periodPctFor(sgrideStats, period, sgrideCfg.fallbacks[period])
  const sgrideTotal  = fmtPct(sgrideStats?.profitTotalPct, sgrideCfg.fallbacks.total)
  const megiPeriod   = periodPctFor(megiStats,   period, megiCfg.fallbacks[period])
  const megiTotal    = fmtPct(megiStats?.profitTotalPct, megiCfg.fallbacks.total)
  const sgrideAmount = periodAmountFor(sgrideStats, period)
  const megiAmount   = periodAmountFor(megiStats, period)
  const sgrideAmountStr = sgrideAmount ? fmtMoney(sgrideAmount.amount, sgrideAmount.currency) : null
  const megiAmountStr   = megiAmount   ? fmtMoney(megiAmount.amount,   megiAmount.currency)   : null
  const textPreview  = buildText(
    period, dl,
    sgridePeriod, sgrideTotal, sgrideAmountStr,
    megiPeriod,   megiTotal,   megiAmountStr,
  )

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
