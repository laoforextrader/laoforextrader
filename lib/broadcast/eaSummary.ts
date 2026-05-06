// Orchestrator for the "ea-summary" template:
//   1. Fetch live stats from Sanity (sgride + megihedge)
//   2. Render two card images (one per EA)
//   3. Upload both as Sanity assets to get public CDN URLs
//   4. Build the Lao text caption
//   5. Send everything as a single LINE broadcast (2 images + 1 text)
//
// Designed so we can swap data sources or add EAs without changing the
// dispatcher.

import { buildEaCardHtml, type EACardInput } from "./templates/eaCard"
import { loadFontDataUri, renderHtmlToJpeg } from "./render"
import { broadcastLineMessages, lineConfigured, type LineMessage } from "./line"
import {
  fetchEAStats,
  uploadBroadcastAsset,
  fmtPct,
  periodPctFor,
  monthsSinceFirstReturn,
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
  sgridePct: string, sgrideTotal: string,
  megiPct: string, megiTotal: string,
): string {
  const periodLabel = periodLabelLao(period)
  const title = periodTitleLao(period)
  return [
    `📊 ${title} TheRocket EA · ${dateStr}`,
    ``,
    `🚀 SGride`,
    `   ${periodLabel}: ${sgridePct}`,
    `   ລວມ: ${sgrideTotal}`,
    ``,
    `⚡ MegiHedge`,
    `   ${periodLabel}: ${megiPct}`,
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

  const fontDataUri = await loadFontDataUri()
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
  const textPreview  = buildText(period, dl, sgridePeriod, sgrideTotal, megiPeriod, megiTotal)

  // Render both EA cards
  const cardInputs: EACardInput[] = [sgrideCfg, megiCfg].map(cfg => {
    const stats = cfg.eaId === "sgride" ? sgrideStats : megiStats
    const periodPct = periodPctFor(stats, period, cfg.fallbacks[period])
    const totalPct  = fmtPct(stats?.profitTotalPct, cfg.fallbacks.total)
    const monthsRunning = monthsSinceFirstReturn(stats, 7)
    return {
      ea: { name: cfg.name, icon: cfg.icon, theme: cfg.theme },
      period, dateLabel: dl,
      periodPct, totalPct,
      monthsRunning, fontDataUri,
    }
  })

  const imageUrls: string[] = []
  for (let i = 0; i < cardInputs.length; i++) {
    const html = buildEaCardHtml(cardInputs[i])
    const { jpeg } = await renderHtmlToJpeg(html, 1080, 1080)
    const filename = `broadcast-${period}-${EAS[i].shortName.toLowerCase()}-${Date.now()}.jpg`
    const url = await uploadBroadcastAsset(jpeg, filename, "image/jpeg")
    imageUrls.push(url)
  }

  // Send to LINE
  if (!send) {
    return { key: `ea-${period}`, ok: true, status: "rendered (send=false)", imageUrls, textPreview }
  }
  if (!lineConfigured()) {
    return { key: `ea-${period}`, ok: true, status: "rendered, no LINE token", imageUrls, textPreview }
  }

  const messages: LineMessage[] = [
    { type: "image", originalContentUrl: imageUrls[0], previewImageUrl: imageUrls[0] },
    { type: "image", originalContentUrl: imageUrls[1], previewImageUrl: imageUrls[1] },
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
