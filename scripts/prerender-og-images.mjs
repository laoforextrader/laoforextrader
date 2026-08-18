// Pre-render OG images for every article, broker, and static index page.
// Output: public/og/<category>/<slug>.png and public/og/<category>.png
// Run: node scripts/prerender-og-images.mjs
//
// Designed to run in Vercel build (Linux) and locally on Windows/Mac.
// Uses puppeteer-core + @sparticuz/chromium when on Linux, falls back
// to a locally installed Chrome on Windows/Mac via puppeteer.

import { createClient } from '@sanity/client'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OG_DIR = join(ROOT, 'public', 'og')
const FONT_PATH = join(ROOT, 'public', 'fonts', 'NotoSansLao-Bold-v2.ttf')

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f8cr9afb',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   || 'production',
  apiVersion: '2025-04-25',
  useCdn: false,
  // Needed once the production dataset is private — this runs at build time.
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN,
})

// ── candle layout (same as runtime template) ────────────────────────────────
const CANDLES = [
  { x: 20,   y: 320, h: 120, wickTop: 290, wickBottom: 460, color: '#10B981' },
  { x: 60,   y: 260, h: 160, wickTop: 220, wickBottom: 440, color: '#10B981' },
  { x: 140,  y: 200, h: 180, wickTop: 160, wickBottom: 420, color: '#10B981' },
  { x: 220,  y: 240, h: 130, wickTop: 200, wickBottom: 400, color: '#10B981' },
  { x: 300,  y: 180, h: 200, wickTop: 130, wickBottom: 420, color: '#10B981' },
  { x: 380,  y: 220, h: 150, wickTop: 180, wickBottom: 410, color: '#10B981' },
  { x: 500,  y: 170, h: 180, wickTop: 130, wickBottom: 400, color: '#10B981' },
  { x: 580,  y: 200, h: 140, wickTop: 165, wickBottom: 380, color: '#10B981' },
  { x: 700,  y: 160, h: 200, wickTop: 110, wickBottom: 410, color: '#10B981' },
  { x: 780,  y: 190, h: 160, wickTop: 155, wickBottom: 390, color: '#10B981' },
  { x: 900,  y: 140, h: 220, wickTop: 90,  wickBottom: 420, color: '#10B981' },
  { x: 980,  y: 170, h: 170, wickTop: 130, wickBottom: 390, color: '#10B981' },
  { x: 1100, y: 120, h: 240, wickTop: 70,  wickBottom: 430, color: '#10B981' },
  { x: 1160, y: 150, h: 190, wickTop: 110, wickBottom: 400, color: '#10B981' },
  { x: 100,  y: 280, h: 100, wickTop: 250, wickBottom: 410, color: '#EF4444' },
  { x: 180,  y: 250, h: 130, wickTop: 210, wickBottom: 420, color: '#EF4444' },
  { x: 260,  y: 230, h: 110, wickTop: 200, wickBottom: 380, color: '#EF4444' },
  { x: 340,  y: 260, h: 90,  wickTop: 235, wickBottom: 390, color: '#EF4444' },
  { x: 420,  y: 200, h: 140, wickTop: 165, wickBottom: 380, color: '#EF4444' },
  { x: 460,  y: 230, h: 100, wickTop: 205, wickBottom: 370, color: '#EF4444' },
  { x: 540,  y: 190, h: 130, wickTop: 155, wickBottom: 360, color: '#EF4444' },
  { x: 620,  y: 220, h: 110, wickTop: 190, wickBottom: 375, color: '#EF4444' },
  { x: 740,  y: 210, h: 110, wickTop: 180, wickBottom: 370, color: '#EF4444' },
  { x: 820,  y: 200, h: 140, wickTop: 165, wickBottom: 390, color: '#EF4444' },
  { x: 940,  y: 180, h: 130, wickTop: 145, wickBottom: 360, color: '#EF4444' },
  { x: 1020, y: 200, h: 100, wickTop: 170, wickBottom: 350, color: '#EF4444' },
  { x: 1060, y: 175, h: 120, wickTop: 140, wickBottom: 350, color: '#EF4444' },
  { x: 1140, y: 160, h: 130, wickTop: 125, wickBottom: 345, color: '#EF4444' },
]

const STYLES = {
  education: { bg: 'linear-gradient(160deg,#0A0E1A 0%,#111827 50%,#0D1220 100%)', accent:'#EAB308', badgeBg:'linear-gradient(135deg,#EAB308,#CA8A04)', badgeColor:'#000', catBg:'rgba(234,179,8,0.12)', catBorder:'rgba(234,179,8,0.3)', catColor:'#EAB308', eyebrow:'#EAB308', candleOpacity:0.07 },
  broker:    { bg: 'linear-gradient(160deg,#0A0E1A 0%,#111827 50%,#0D1220 100%)', accent:'#EAB308', badgeBg:'linear-gradient(135deg,#EAB308,#CA8A04)', badgeColor:'#000', catBg:'rgba(234,179,8,0.12)', catBorder:'rgba(234,179,8,0.3)', catColor:'#EAB308', eyebrow:'#EAB308', candleOpacity:0.07 },
  'ea-tools':{ bg: 'linear-gradient(135deg,#060C1B 0%,#0D1829 60%,#060C1B 100%)', accent:'#22D3EE', badgeBg:'linear-gradient(135deg,#0891B2,#06B6D4)', badgeColor:'#fff', catBg:'rgba(6,182,212,0.12)', catBorder:'rgba(6,182,212,0.3)', catColor:'#22D3EE', eyebrow:'#22D3EE', candleOpacity:0.06 },
  analysis:  { bg: 'linear-gradient(140deg,#04110C 0%,#071A10 50%,#050F09 100%)', accent:'#34D399', badgeBg:'linear-gradient(135deg,#059669,#10B981)', badgeColor:'#fff', catBg:'rgba(16,185,129,0.12)', catBorder:'rgba(16,185,129,0.3)', catColor:'#34D399', eyebrow:'#34D399', candleOpacity:0.09 },
  news:      { bg: 'linear-gradient(140deg,#04110C 0%,#071A10 50%,#050F09 100%)', accent:'#34D399', badgeBg:'linear-gradient(135deg,#059669,#10B981)', badgeColor:'#fff', catBg:'rgba(16,185,129,0.12)', catBorder:'rgba(16,185,129,0.3)', catColor:'#34D399', eyebrow:'#34D399', candleOpacity:0.09 },
  lessons:   { bg: 'linear-gradient(160deg,#0A0E1A 0%,#111827 50%,#0D1220 100%)', accent:'#EAB308', badgeBg:'linear-gradient(135deg,#EAB308,#CA8A04)', badgeColor:'#000', catBg:'rgba(234,179,8,0.12)', catBorder:'rgba(234,179,8,0.3)', catColor:'#EAB308', eyebrow:'#EAB308', candleOpacity:0.07 },
  tools:     { bg: 'linear-gradient(135deg,#060C1B 0%,#0D1829 60%,#060C1B 100%)', accent:'#22D3EE', badgeBg:'linear-gradient(135deg,#0891B2,#06B6D4)', badgeColor:'#fff', catBg:'rgba(6,182,212,0.12)', catBorder:'rgba(6,182,212,0.3)', catColor:'#22D3EE', eyebrow:'#22D3EE', candleOpacity:0.06 },
}

const LABELS = {
  education: 'Education', 'ea-tools': 'EA Tools', broker: 'Broker',
  analysis: 'Analysis',  news: 'News', lessons: 'Lessons', tools: 'Tools',
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}

function buildHtml({ title, excerpt, category, readTime }, fontUri) {
  const style = STYLES[category] || STYLES.education
  const catLabel = LABELS[category] || category
  const t = (title || 'LaoForexTrader').normalize('NFC')
  const e = ((excerpt || '').slice(0, 110)).normalize('NFC')
  const isEA = category === 'ea-tools'
  const titleSize = t.length > 40 ? 42 : 48

  const candles = CANDLES.map(c => `
      <div style="position:absolute;left:${c.x + 8}px;top:${c.wickTop}px;width:2px;height:${c.wickBottom - c.wickTop}px;background:${c.color};border-radius:1px;"></div>
      <div style="position:absolute;left:${c.x}px;top:${c.y}px;width:18px;height:${c.h}px;background:${c.color};"></div>`).join('')

  return `<!DOCTYPE html>
<html lang="lo">
<head>
<meta charset="utf-8">
<style>
  @font-face { font-family:'NotoSansLao'; src:url('${fontUri}') format('truetype'); font-weight:100 900; font-display:block; }
  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
  html,body { margin:0; padding:0; background:#000; }
  .root { width:1200px; height:630px; padding:52px 80px; background:${style.bg};
    position:relative; overflow:hidden; font-family:'NotoSansLao',sans-serif;
    display:flex; flex-direction:column; justify-content:space-between; color:#fff; }
  .candles { position:absolute; inset:0; opacity:${style.candleOpacity}; pointer-events:none; }
  .grad-bottom { position:absolute; bottom:0; left:0; right:0; height:60%;
    background:linear-gradient(to bottom,transparent,rgba(0,0,0,0.88)); }
  .grad-left { position:absolute; top:0; bottom:0; left:0; width:50%;
    background:linear-gradient(to right,rgba(0,0,0,0.35),transparent); }
  ${isEA ? `.ea-line { position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg,transparent,${style.accent},transparent); opacity:0.7; }` : ''}
  .header { display:flex; align-items:center; justify-content:space-between; position:relative; z-index:10; }
  .brand { display:flex; align-items:center; gap:10px; }
  .badge { background:${style.badgeBg}; border-radius:8px; padding:6px 16px;
    color:${style.badgeColor}; font-size:20px; font-weight:900; line-height:1; }
  .brand-name { color:rgba(255,255,255,0.45); font-size:16px; font-weight:500; }
  .cat-pill { background:${style.catBg}; border:1px solid ${style.catBorder};
    border-radius:100px; padding:5px 18px; color:${style.catColor};
    font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; }
  .body { display:flex; flex-direction:column; flex:1; justify-content:center;
    padding:32px 0 20px; position:relative; z-index:10; }
  .eyebrow { display:flex; align-items:center; gap:10px; color:${style.eyebrow};
    font-size:14px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:16px; }
  .eyebrow-bar { width:28px; height:2px; background:${style.eyebrow}; border-radius:2px; }
  .title { color:#fff; font-size:${titleSize}px; font-weight:900;
    line-height:1.12; letter-spacing:-0.03em; margin-bottom:20px; }
  .excerpt { color:rgba(255,255,255,0.45); font-size:20px; line-height:1.6; max-width:820px; font-weight:400; }
  .footer { display:flex; align-items:center; justify-content:space-between;
    padding-top:20px; border-top:1px solid rgba(255,255,255,0.07); position:relative; z-index:10; }
  .footer-left { color:rgba(255,255,255,0.28); font-size:14px; font-weight:500; }
  .footer-right { background:rgba(255,255,255,0.07); border-radius:100px; padding:5px 16px;
    color:rgba(255,255,255,0.35); font-size:13px; }
</style>
</head>
<body>
<div class="root">
  <div class="candles">${candles}</div>
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
    <div class="eyebrow"><span class="eyebrow-bar"></span>${isEA ? '● LIVE ACCOUNT' : escapeHtml(catLabel)}</div>
    <div class="title">${escapeHtml(t)}</div>
    ${e ? `<div class="excerpt">${escapeHtml(e)}</div>` : ''}
  </div>
  <div class="footer">
    <div class="footer-left">laoforextrader.com</div>
    <div class="footer-right">${readTime ? `${readTime} ນາທີ` : 'LaoForexTrader'}</div>
  </div>
</div>
</body>
</html>`
}

function findLocalChrome() {
  if (process.platform === 'win32') {
    const paths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ].filter(Boolean)
    return paths.find(p => existsSync(p))
  }
  if (process.platform === 'darwin') {
    return existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : null
  }
  return null
}

async function launchBrowser() {
  const localChrome = findLocalChrome()
  if (localChrome) {
    console.log(`[og] using local Chrome: ${localChrome}`)
    return puppeteer.launch({
      executablePath: localChrome,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
      defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
    })
  }
  console.log('[og] using @sparticuz/chromium')
  return puppeteer.launch({
    args: [...chromium.args, '--font-render-hinting=none'],
    defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
    executablePath: await chromium.executablePath(),
  })
}

async function renderOne(browser, html, outPath) {
  await mkdir(dirname(outPath), { recursive: true })
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    const buffer = await page.screenshot({
      type: 'png',
      omitBackground: false,
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    })
    await writeFile(outPath, buffer)
  } finally {
    await page.close().catch(() => {})
  }
}

async function main() {
  console.log('[og] loading font…')
  const fontBuf = await readFile(FONT_PATH)
  const fontUri = `data:font/ttf;base64,${fontBuf.toString('base64')}`

  console.log('[og] fetching content from Sanity…')
  const [articles, brokers] = await Promise.all([
    sanity.fetch(`*[_type == "article" && defined(slug.current)]{
      _id, title, excerpt, category, readTime, "slug": slug.current
    }`),
    sanity.fetch(`*[_type == "broker" && defined(slug.current)]{
      _id, name, excerpt, "slug": slug.current
    }`),
  ])
  console.log(`[og]   ${articles.length} articles, ${brokers.length} brokers`)

  const browser = await launchBrowser()

  // Static index pages
  const indexes = [
    { category: 'lessons',   title: 'ບົດຮຽນ Forex',          excerpt: 'ບົດຮຽນເທຣດ Forex ແບບເປັນຂັ້ນຕອນ ຈາກພື້ນຖານສູ່ມືອາຊີບ' },
    { category: 'education', title: 'ການສຶກສາ Forex',        excerpt: 'ຮຽນ Forex ຟຣີ ສຳລັບຄົນລາວ ຕັ້ງແຕ່ພື້ນຖານຈົນເຖິງຂັ້ນສູງ' },
    { category: 'broker',    title: 'ລີວິວ Broker Forex',    excerpt: 'ປຽບທຽບ Broker ທີ່ດີທີ່ສຸດ ຝາກຖອນສະດວກໃນລາວ' },
    { category: 'news',      title: 'ຂ່າວສານຕະຫຼາດການເງິນ',  excerpt: 'ຂ່າວ Forex, ທອງຄຳ XAUUSD ແລະ Crypto ອັບເດດທຸກວັນ' },
    { category: 'analysis',  title: 'ວິເຄາະຕະຫຼາດ Forex',    excerpt: 'ວິເຄາະ EURUSD, XAUUSD, DXY ປະຈຳວັນ ສຳລັບເທຣດເດີລາວ' },
    { category: 'tools',     title: 'ເຄື່ອງມືຄຳນວນ Forex',   excerpt: 'Pip Calculator, Lot Calculator ແລະ ເຄື່ອງມືຊ່ວຍເທຣດ Forex' },
  ]

  let count = 0
  for (const idx of indexes) {
    const out = join(OG_DIR, `${idx.category}.png`)
    await renderOne(browser, buildHtml(idx, fontUri), out)
    count++
    console.log(`[og] index  ${idx.category}.png`)
  }

  // Default fallback (used by articles published after the last build)
  await renderOne(browser, buildHtml({
    title: 'LaoForexTrader',
    excerpt: 'ແຫຼ່ງຂໍ້ມູນການເທຣດ #1 ສຳລັບຄົນລາວ',
    category: 'education',
  }, fontUri), join(OG_DIR, '_default.png'))
  console.log('[og] default _default.png')
  count++

  // Articles
  for (const a of articles) {
    const out = join(OG_DIR, a.category || 'education', `${a.slug}.png`)
    await renderOne(browser, buildHtml({
      title: a.title, excerpt: a.excerpt, category: a.category, readTime: a.readTime,
    }, fontUri), out)
    count++
    if (count % 10 === 0) console.log(`[og] …${count} rendered`)
  }

  // Brokers
  for (const b of brokers) {
    const out = join(OG_DIR, 'broker', `${b.slug}.png`)
    await renderOne(browser, buildHtml({
      title: `ລີວິວ ${b.name}`, excerpt: b.excerpt, category: 'broker',
    }, fontUri), out)
    count++
  }

  await browser.close()
  console.log(`[og] done — rendered ${count} images to public/og/`)
}

main().catch(err => {
  console.error('[og] failed:', err)
  process.exit(1)
})
