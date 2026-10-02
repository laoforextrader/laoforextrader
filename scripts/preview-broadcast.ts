// Render broadcast images (one per EA per period) + print text messages.
// Uses live EA stats from Sanity. Saves to /broadcast-preview/.
//
// Run: npx tsx scripts/preview-broadcast.ts
//
// The captions come from runEaSummaryBroadcast({ send: false }) — the exact
// function the cron calls — so what this prints is what LINE would receive.
// It used to reimplement the percentage/money maths locally, and the copy
// drifted: it never learned about MEGI_COMING_SOON, and it kept the old
// balance-derived money formula after the real one was fixed.

import "dotenv/config"
import { config as dotenvConfig } from "dotenv"
dotenvConfig({ path: ".env.local" })

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
import {
  fetchEAStats,
  fmtPct,
  monthsSinceFirstReturn,
  periodPctFor,
  type EAStatsLite,
} from "../lib/broadcast/sanity"
import { runEaSummaryBroadcast } from "../lib/broadcast/eaSummary"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const OUT_DIR = join(ROOT, "broadcast-preview")
const FONT_PATH = join(ROOT, "public", "fonts", "NotoSansLao-Bold-v2.ttf")

// Numeric date helpers — user wants DD-MM-YYYY everywhere now
function pad(n: number): string { return n < 10 ? `0${n}` : String(n) }
function ddmmyyyy(d: Date): string {
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
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

function dateLabel(period: Period, now: Date): string {
  if (period === "daily") return ddmmyyyy(now)
  const start = new Date(now)
  start.setDate(now.getDate() - 6)
  return `${ddmmyyyy(start)} → ${ddmmyyyy(now)}`
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
  const statsByEa = new Map<string, EAStatsLite | null>()
  for (const ea of EAS) {
    const s = await fetchEAStats(ea.eaId)
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
    // The caption owns the monthly date label (it has to match the month it
    // reports on), so only the card images need one computed here.
    const dl = period === "monthly" ? "" : dateLabel(period, now)

    for (const ea of EAS) {
      const stats = statsByEa.get(ea.eaId) ?? null
      const periodPctStr = periodPctFor(stats, period, ea.fallbacks[period], now)
      const totalPctStr  = fmtPct(stats?.profitTotalPct, ea.fallbacks.total)
      const monthsRunning = monthsSinceFirstReturn(stats)

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

    // Exactly what the cron would push, minus the LINE call.
    const { textPreview: text } = await runEaSummaryBroadcast({ period, send: false, now })
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
