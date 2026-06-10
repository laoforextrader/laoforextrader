// Render broadcast images (one per EA per period) + print text messages.
// Uses live EA stats from Sanity. Saves to /broadcast-preview/.
//
// Run: npx tsx scripts/preview-broadcast.ts

import "dotenv/config"
import { config as dotenvConfig } from "dotenv"
dotenvConfig({ path: ".env.local" })

import { createClient } from "@sanity/client"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { mkdir, writeFile, readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import puppeteer from "puppeteer-core"
import {
  buildEaCardHtml,
  type Period,
  type EACardInput,
} from "../lib/broadcast/templates/eaCard"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const OUT_DIR = join(ROOT, "broadcast-preview")
const FONT_PATH = join(ROOT, "public", "fonts", "NotoSansLao-Bold-v2.ttf")

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f8cr9afb",
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   || "production",
  apiVersion: "2025-04-25",
  useCdn: false,
})

// Numeric date helpers — user wants DD-MM-YYYY everywhere now
function pad(n: number): string { return n < 10 ? `0${n}` : String(n) }
function ddmmyyyy(d: Date): string {
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}
function mmyyyy(d: Date): string {
  return `${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}

interface SanityEAStats {
  eaId: string
  profitTotalPct?: number
  balance?: number
  currency?: string
  monthlyReturns?: { month: string; profitPct: number }[]
  dailyReturns?: { date: string; profitPct: number }[]
  updateMode?: string
}

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
    name: "TheRocket SGride",
    shortName: "SGride",
    icon: "rocket",
    theme: "blue",
    strategy: "Grid",
    risk: "Medium",
    fallbacks: { daily: "+2.4%", weekly: "+12.5%", monthly: "+18.7%", total: "+500%" },
  },
  {
    eaId: "megihedge",
    name: "TheRocket MegiHedge v2.0",
    shortName: "MegiHedge v2.0",
    icon: "zap",
    theme: "purple",
    strategy: "Hedging",
    risk: "Higher",
    fallbacks: { daily: "+3.1%", weekly: "+18.3%", monthly: "+22.4%", total: "+320%" },
  },
]

function fmtPct(n: number | undefined, fallback: string): string {
  if (n === undefined || n === null || isNaN(n)) return fallback
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toFixed(1)}%`
}

async function fetchStats(eaId: string): Promise<SanityEAStats | null> {
  try {
    const r = await sanity.fetch<SanityEAStats>(
      `*[_type == "eaStats" && eaId == $eaId][0] {
        eaId, updateMode, profitTotalPct, balance, currency,
        monthlyReturns[] { month, profitPct },
        dailyReturns[] { date, profitPct }
      }`,
      { eaId },
    )
    if (!r || r.updateMode === "off") return null
    return r
  } catch {
    return null
  }
}

function periodPctNumber(s: SanityEAStats | null, period: Period): number | null {
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
  const m = s.monthlyReturns ?? []
  const v = m[m.length - 1]?.profitPct
  return typeof v === "number" && !isNaN(v) ? v : null
}

const CENT_CURRENCIES: Record<string, string> = { USC: "USD", CNT: "USD", EUC: "EUR" }

function periodAmount(s: SanityEAStats | null, period: Period): { amount: number; currency: string } | null {
  if (!s?.balance || s.balance <= 0) return null
  const pct = periodPctNumber(s, period)
  if (pct === null || pct <= -100) return null
  let amount = (s.balance * pct) / (100 + pct)
  let currency = s.currency || "USD"
  if (CENT_CURRENCIES[currency]) {
    amount = amount / 100
    currency = CENT_CURRENCIES[currency]
  }
  return { amount, currency }
}

function fmtMoney(amount: number, currency: string): string {
  const sign = amount >= 0 ? "+" : "-"
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const symbol = currency === "USD" ? "$"
              : currency === "EUR" ? "€"
              : currency === "GBP" ? "£"
              : currency === "JPY" ? "¥"
              : ""
  return symbol ? `${sign}${symbol}${formatted}` : `${sign}${formatted} ${currency}`
}

function periodPctFor(s: SanityEAStats | null, period: Period, fallbacks: EAConfig["fallbacks"]): string {
  if (period === "daily") {
    const d = s?.dailyReturns ?? []
    return fmtPct(d[d.length - 1]?.profitPct, fallbacks.daily)
  }
  if (period === "weekly") {
    const d = s?.dailyReturns ?? []
    if (d.length === 0) return fallbacks.weekly
    const last7 = d.slice(-7)
    const sum = last7.reduce((acc, r) => acc + (r.profitPct ?? 0), 0)
    return fmtPct(sum, fallbacks.weekly)
  }
  // monthly
  const m = s?.monthlyReturns ?? []
  return fmtPct(m[m.length - 1]?.profitPct, fallbacks.monthly)
}

function totalPct(s: SanityEAStats | null, fallback: string): string {
  return fmtPct(s?.profitTotalPct, fallback)
}

function dateLabel(period: Period, now: Date): string {
  if (period === "daily") return ddmmyyyy(now)
  if (period === "weekly") {
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    return `${ddmmyyyy(start)} → ${ddmmyyyy(now)}`
  }
  return mmyyyy(now)
}

function monthsSince(monthStr: string | undefined): number {
  if (!monthStr) return 0
  const m = monthStr.match(/^(\d{4})-(\d{1,2})$/)
  if (!m) return 0
  const sy = parseInt(m[1], 10)
  const sm = parseInt(m[2], 10) - 1
  if (isNaN(sy) || isNaN(sm)) return 0
  const now = new Date()
  const months = (now.getFullYear() - sy) * 12 + (now.getMonth() - sm) + 1
  return Math.max(1, months)
}

function buildText(
  period: Period, dateLabelStr: string,
  sgridePeriod: string, sgrideTotal: string, sgrideAmount: string | null,
  megiPeriod: string, megiTotal: string, megiAmount: string | null,
): string {
  const periodLabelLao =
    period === "daily" ? "ມື້ນີ້" : period === "weekly" ? "ອາທິດນີ້" : "ເດືອນນີ້"
  const titleLao =
    period === "daily" ? "ຜົນງານປະຈຳວັນ"
  : period === "weekly" ? "ສະຫຼຸບປະຈຳອາທິດ"
                        : "ສະຫຼຸບປະຈຳເດືອນ"
  const sgrideLine = sgrideAmount
    ? `   ${periodLabelLao}: ${sgridePeriod} (${sgrideAmount})`
    : `   ${periodLabelLao}: ${sgridePeriod}`
  const megiLine = megiAmount
    ? `   ${periodLabelLao}: ${megiPeriod} (${megiAmount})`
    : `   ${periodLabelLao}: ${megiPeriod}`
  return [
    `📊 ${titleLao} TheRocket EA · ${dateLabelStr}`,
    ``,
    `🚀 SGride`,
    sgrideLine,
    `   ລວມ: ${sgrideTotal}`,
    ``,
    `⚡ MegiHedge v2.0`,
    megiLine,
    `   ລວມ: ${megiTotal}`,
    ``,
    `▶ ເບິ່ງລາຍລະອຽດ: https://www.laoforextrader.com/ea-system`,
  ].join("\n")
}

function findLocalChrome(): string | null {
  if (process.platform === "win32") {
    const candidates = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ].filter(Boolean) as string[]
    return candidates.find(p => existsSync(p)) ?? null
  }
  if (process.platform === "darwin") {
    const p = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    return existsSync(p) ? p : null
  }
  return null
}

async function renderCard(browser: import("puppeteer-core").Browser, html: string, outPng: string, outJpg: string) {
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 })
    // Give the bg <script> a beat to finish drawing on the canvas.
    await new Promise(r => setTimeout(r, 200))
    const png = await page.screenshot({
      type: "png", omitBackground: false,
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
    })
    const jpg = await page.screenshot({
      type: "jpeg", quality: 90, omitBackground: false,
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
    })
    await writeFile(outPng, png)
    await writeFile(outJpg, jpg)
    return { png: png.length, jpg: jpg.length }
  } finally {
    await page.close().catch(() => {})
  }
}

async function main() {
  console.log("[preview] loading font…")
  const fontBuf = await readFile(FONT_PATH)
  const fontDataUri = `data:font/ttf;base64,${fontBuf.toString("base64")}`

  console.log("[preview] fetching EA stats…")
  const statsByEa = new Map<string, SanityEAStats | null>()
  for (const ea of EAS) {
    const s = await fetchStats(ea.eaId)
    statsByEa.set(ea.eaId, s)
    console.log(`[preview]   ${ea.eaId}: ${s ? "✓ live data" : "✗ falling back to defaults"}`)
  }

  const chrome = findLocalChrome()
  if (!chrome) {
    console.error("[preview] couldn't locate local Chrome — install Chrome or run on a machine that has it")
    process.exit(1)
  }
  console.log(`[preview] launching Chrome: ${chrome}`)

  const browser = await puppeteer.launch({
    executablePath: chrome,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
    defaultViewport: { width: 1080, height: 1080, deviceScaleFactor: 1 },
  })

  await mkdir(OUT_DIR, { recursive: true })
  const now = new Date()

  const periods: Period[] = ["daily", "weekly", "monthly"]
  for (const period of periods) {
    const dl = dateLabel(period, now)
    const periodPcts: Record<string, string> = {}
    const totalPcts: Record<string, string> = {}

    for (const ea of EAS) {
      const stats = statsByEa.get(ea.eaId) ?? null
      const periodPctStr = periodPctFor(stats, period, ea.fallbacks)
      const totalPctStr  = totalPct(stats, ea.fallbacks.total)
      const monthsRunning = monthsSince(stats?.monthlyReturns?.[0]?.month) || 7
      periodPcts[ea.eaId] = periodPctStr
      totalPcts[ea.eaId]  = totalPctStr

      const input: EACardInput = {
        ea: { name: ea.name, icon: ea.icon, theme: ea.theme },
        period, dateLabel: dl,
        periodPct: periodPctStr,
        totalPct: totalPctStr,
        monthsRunning,
        fontDataUri,
      }
      const html = buildEaCardHtml(input)
      const outPng = join(OUT_DIR, `${period}-${ea.shortName.toLowerCase()}.png`)
      const outJpg = join(OUT_DIR, `${period}-${ea.shortName.toLowerCase()}.jpg`)
      const sizes = await renderCard(browser, html, outPng, outJpg)
      console.log(`[preview] ${period}/${ea.shortName}: jpg ${(sizes.jpg / 1024).toFixed(1)} KB`)
    }

    const sgrideAmt = periodAmount(statsByEa.get("sgride") ?? null, period)
    const megiAmt   = periodAmount(statsByEa.get("megihedge") ?? null, period)
    const sgrideAmtStr = sgrideAmt ? fmtMoney(sgrideAmt.amount, sgrideAmt.currency) : null
    const megiAmtStr   = megiAmt   ? fmtMoney(megiAmt.amount,   megiAmt.currency)   : null
    const text = buildText(
      period, dl,
      periodPcts["sgride"], totalPcts["sgride"], sgrideAmtStr,
      periodPcts["megihedge"], totalPcts["megihedge"], megiAmtStr,
    )
    const txtPath = join(OUT_DIR, `${period}.txt`)
    await writeFile(txtPath, text, "utf8")

    console.log(`\n[preview] === ${period.toUpperCase()} text ===`)
    console.log(text.split("\n").map(l => `    ${l}`).join("\n"))
    console.log("")
  }

  await browser.close()
  console.log(`[preview] done — review files in ${OUT_DIR}`)
}

main().catch(err => {
  console.error("[preview] failed:", err)
  process.exit(1)
})
