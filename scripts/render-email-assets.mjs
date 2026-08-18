/**
 * Render the PNGs the newsletter needs into public/email/.
 *
 * Email cannot use the site's SVGs: Gmail strips <svg> outright, and every
 * client that does render images wants a plain raster at a fixed pixel size.
 * So the logo and the four channel icons are baked once, at 2x, and served
 * from the site as ordinary <img src> absolute URLs.
 *
 * Reuses the Chrome that scripts/prerender-og-images.mjs already depends on.
 *
 * Run: node scripts/render-email-assets.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'email')

function findLocalChrome() {
  if (process.platform === 'win32') {
    return [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ].filter(Boolean).find(p => existsSync(p))
  }
  if (process.platform === 'darwin') {
    const p = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    return existsSync(p) ? p : null
  }
  return null
}

async function launchBrowser() {
  const local = findLocalChrome()
  if (local) return puppeteer.launch({ executablePath: local, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  return puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath() })
}

// Brand marks, drawn rather than fetched — no CDN, no hotlinking, and they
// stay identical every time the script runs.
const ICONS = {
  line: {
    bg: '#06C755',
    path: 'M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.98C23.176 14.393 24 12.458 24 10.314',
  },
  youtube: {
    bg: '#FF0000',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  tiktok: {
    bg: '#000000',
    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
  facebook: {
    bg: '#1877F2',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
}

function iconHtml(icon, size) {
  return `<html><body style="margin:0;background:transparent">
    <div style="width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.28)}px;background:${icon.bg};display:flex;align-items:center;justify-content:center">
      <svg width="${Math.round(size * 0.56)}" height="${Math.round(size * 0.56)}" viewBox="0 0 24 24" fill="#fff"><path d="${icon.path}"/></svg>
    </div></body></html>`
}

async function shoot(browser, html, w, h, out) {
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
    await page.setContent(html, { waitUntil: 'load' })
    const buf = await page.screenshot({ type: 'png', omitBackground: true })
    await writeFile(out, buf)
    console.log(`  ✓ ${out.slice(ROOT.length + 1)}`)
  } finally {
    await page.close()
  }
}

const browser = await launchBrowser()
await mkdir(OUT, { recursive: true })

// Logo: the site SVG inlined onto a white plate, so it survives dark-mode
// clients that would otherwise invert the artwork into mud.
const logoSvg = readFileSync(join(ROOT, 'public', 'logo.svg'), 'utf8')
await shoot(
  browser,
  `<html><body style="margin:0;background:transparent">
     <div style="width:160px;height:160px;display:flex;align-items:center;justify-content:center">
       <div style="width:150px;height:150px">${logoSvg}</div>
     </div></body></html>`,
  160, 160, join(OUT, 'logo.png'),
)

for (const [name, icon] of Object.entries(ICONS)) {
  await shoot(browser, iconHtml(icon, 44), 44, 44, join(OUT, `${name}.png`))
}

await browser.close()
console.log('\nemail assets rendered into public/email/')
