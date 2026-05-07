// Render a broadcast HTML template to JPEG bytes using a headless
// chromium loaded from the @sparticuz/chromium-min CDN. Designed to
// run in a Vercel Node.js function (cron handler).

import puppeteer, { Browser } from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import fs from "node:fs"
import path from "node:path"

// Use the bundled chromium binary so cold-start fits in cron-job.org's
// 30s free-tier timeout. The binary inflates a Brotli pack from inside
// node_modules instead of downloading from a CDN.

let browserPromise: Promise<Browser> | null = null

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    try {
      const b = await browserPromise
      if (b.connected) return b
    } catch {
      browserPromise = null
    }
  }
  browserPromise = puppeteer.launch({
    args: [...chromium.args, "--font-render-hinting=none"],
    defaultViewport: { width: 1080, height: 1080, deviceScaleFactor: 1 },
    executablePath: await chromium.executablePath(),
  })
  return browserPromise
}

let cachedFontUri: string | null = null
async function getFontDataUri(): Promise<string> {
  if (cachedFontUri) return cachedFontUri
  const candidates = [
    path.join(process.cwd(), "public/fonts/NotoSansLao-Bold-v2.ttf"),
    path.join(process.cwd(), ".next/server/public/fonts/NotoSansLao-Bold-v2.ttf"),
  ]
  for (const p of candidates) {
    try {
      const buf = fs.readFileSync(p)
      cachedFontUri = `data:font/ttf;base64,${buf.toString("base64")}`
      return cachedFontUri
    } catch {}
  }
  // Fallback to public URL — slower but works
  const res = await fetch("https://www.laoforextrader.com/fonts/NotoSansLao-Bold-v2.ttf")
  if (!res.ok) throw new Error("Failed to load Lao font for broadcast image")
  const ab = await res.arrayBuffer()
  cachedFontUri = `data:font/ttf;base64,${Buffer.from(ab).toString("base64")}`
  return cachedFontUri
}

export async function loadFontDataUri(): Promise<string> {
  return getFontDataUri()
}

export interface RenderResult {
  jpeg: Buffer
}

export async function renderHtmlToJpeg(html: string, width = 1080, height = 1080): Promise<RenderResult> {
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    await page.setViewport({ width, height, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 })
    // Give inline canvas scripts a beat to finish.
    await new Promise(r => setTimeout(r, 200))
    const jpeg = await page.screenshot({
      type: "jpeg",
      quality: 88,
      omitBackground: false,
      clip: { x: 0, y: 0, width, height },
    })
    return { jpeg: Buffer.from(jpeg) }
  } finally {
    await page.close().catch(() => {})
  }
}
