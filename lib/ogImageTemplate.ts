import chromium from '@sparticuz/chromium'
import puppeteer, { Browser } from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { CANDLES, getOGStyle, CATEGORY_LABELS } from './ogCandlesticks'

export const OG_SIZE = { width: 1200, height: 630 }

let fontDataUri: string | null = null
async function getFontDataUri(): Promise<string> {
  if (fontDataUri) return fontDataUri
  const candidates = [
    path.join(process.cwd(), 'public/fonts/NotoSansLao-Bold-v2.ttf'),
    path.join(process.cwd(), '.next/server/public/fonts/NotoSansLao-Bold-v2.ttf'),
  ]
  for (const p of candidates) {
    try {
      const buf = fs.readFileSync(p)
      fontDataUri = `data:font/ttf;base64,${buf.toString('base64')}`
      return fontDataUri
    } catch {}
  }
  const res = await fetch('https://www.laoforextrader.com/fonts/NotoSansLao-Bold-v2.ttf')
  if (!res.ok) throw new Error('Failed to load Lao font for OG image')
  const ab = await res.arrayBuffer()
  fontDataUri = `data:font/ttf;base64,${Buffer.from(ab).toString('base64')}`
  return fontDataUri
}

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
    args: [...chromium.args, '--font-render-hinting=none'],
    defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
    executablePath: await chromium.executablePath(),
  })
  return browserPromise
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHtml(article: {
  title: string
  excerpt?: string
  category: string
  readTime?: number
}, fontUri: string): string {
  const style = getOGStyle(article.category)
  const catLabel = CATEGORY_LABELS[article.category] || article.category
  const title = (article.title || 'LaoForexTrader').normalize('NFC')
  const excerpt = (article.excerpt?.slice(0, 110) || '').normalize('NFC')
  const isEA = article.category === 'ea-tools'
  const titleSize = title.length > 40 ? 42 : 48

  const candlesHtml = CANDLES.map(c => `
      <div style="position:absolute;left:${c.x + 8}px;top:${c.wickTop}px;width:2px;height:${c.wickBottom - c.wickTop}px;background:${c.color};border-radius:1px;"></div>
      <div style="position:absolute;left:${c.x}px;top:${c.y}px;width:18px;height:${c.h}px;background:${c.color};"></div>`).join('')

  return `<!DOCTYPE html>
<html lang="lo">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'NotoSansLao';
    src: url('${fontUri}') format('truetype');
    font-weight: 100 900;
    font-display: block;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; }
  .root {
    width: 1200px;
    height: 630px;
    padding: 52px 80px;
    background: ${style.bg};
    position: relative;
    overflow: hidden;
    font-family: 'NotoSansLao', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #fff;
  }
  .candles { position: absolute; inset: 0; opacity: ${style.candleOpacity}; pointer-events: none; }
  .grad-bottom {
    position: absolute; bottom: 0; left: 0; right: 0; height: 60%;
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.88));
  }
  .grad-left {
    position: absolute; top: 0; bottom: 0; left: 0; width: 50%;
    background: linear-gradient(to right, rgba(0,0,0,0.35), transparent);
  }
  ${isEA ? `.ea-line { position:absolute; top:0; left:0; right:0; height:3px;
    background: linear-gradient(90deg, transparent, ${style.accent}, transparent); opacity:0.7; }` : ''}
  .header {
    display: flex; align-items: center; justify-content: space-between;
    position: relative; z-index: 10;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .badge {
    background: ${style.badgeBg}; border-radius: 8px; padding: 6px 16px;
    color: ${style.badgeColor}; font-size: 20px; font-weight: 900;
    line-height: 1;
  }
  .brand-name { color: rgba(255,255,255,0.45); font-size: 16px; font-weight: 500; }
  .cat-pill {
    background: ${style.catBg}; border: 1px solid ${style.catBorder};
    border-radius: 100px; padding: 5px 18px;
    color: ${style.catColor}; font-size: 13px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .body {
    display: flex; flex-direction: column; flex: 1; justify-content: center;
    padding: 32px 0 20px; position: relative; z-index: 10;
  }
  .eyebrow {
    display: flex; align-items: center; gap: 10px;
    color: ${style.eyebrow}; font-size: 14px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px;
  }
  .eyebrow-bar { width: 28px; height: 2px; background: ${style.eyebrow}; border-radius: 2px; }
  .title {
    color: #fff; font-size: ${titleSize}px; font-weight: 900;
    line-height: 1.12; letter-spacing: -0.03em; margin-bottom: 20px;
  }
  .excerpt {
    color: rgba(255,255,255,0.45); font-size: 20px; line-height: 1.6;
    max-width: 820px; font-weight: 400;
  }
  .footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.07);
    position: relative; z-index: 10;
  }
  .footer-left { color: rgba(255,255,255,0.28); font-size: 14px; font-weight: 500; }
  .footer-right {
    background: rgba(255,255,255,0.07); border-radius: 100px; padding: 5px 16px;
    color: rgba(255,255,255,0.35); font-size: 13px;
  }
</style>
</head>
<body>
<div class="root">
  <div class="candles">${candlesHtml}</div>
  <div class="grad-bottom"></div>
  <div class="grad-left"></div>
  ${isEA ? '<div class="ea-line"></div>' : ''}
  <div class="header">
    <div class="brand">
      <div class="badge">LFT</div>
      <div class="brand-name">LaoForexTrader</div>
    </div>
    <div class="cat-pill">${escapeHtml(catLabel)}</div>
  </div>
  <div class="body">
    <div class="eyebrow">
      <span class="eyebrow-bar"></span>
      ${isEA ? '● LIVE ACCOUNT' : escapeHtml(catLabel)}
    </div>
    <div class="title">${escapeHtml(title)}</div>
    ${excerpt ? `<div class="excerpt">${escapeHtml(excerpt)}</div>` : ''}
  </div>
  <div class="footer">
    <div class="footer-left">laoforextrader.com</div>
    <div class="footer-right">${article.readTime ? `${article.readTime} ນາທີ` : 'LaoForexTrader'}</div>
  </div>
</div>
</body>
</html>`
}

export async function generateOGImage(article: {
  title: string
  excerpt?: string
  category: string
  readTime?: number
}): Promise<Response> {
  const [browser, fontUri] = await Promise.all([getBrowser(), getFontDataUri()])
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
    await page.setContent(buildHtml(article, fontUri), { waitUntil: 'networkidle0', timeout: 15000 })
    const buffer = await page.screenshot({ type: 'png', omitBackground: false, clip: { x: 0, y: 0, width: 1200, height: 630 } })
    return new Response(buffer as unknown as Uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
      },
    })
  } finally {
    await page.close().catch(() => {})
  }
}
