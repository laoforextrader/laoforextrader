// Screenshot the key pages in both themes into theme-preview/ so the result
// can be eyeballed side by side.
//
//   node scripts/theme-shots.mjs [--base http://localhost:3000]
import puppeteer from "puppeteer-core"
import { existsSync, mkdirSync } from "node:fs"

const args = process.argv.slice(2)
const BASE = (() => { const i = args.indexOf("--base"); return i >= 0 ? args[i + 1] : "http://localhost:3000" })()

function findLocalChrome() {
  const c = process.platform === "win32"
    ? ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
       "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
       `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
       "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"]
    : process.platform === "darwin"
    ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    : ["/usr/bin/google-chrome", "/usr/bin/chromium"]
  return c.filter(Boolean).find(p => existsSync(p)) ?? null
}

const OUT = "theme-preview"
const PAGES = [
  ["home", "/"], ["news", "/news"], ["ea-system", "/ea-system"],
  ["broker", "/broker"], ["lessons", "/lessons"], ["quiz", "/quiz"],
  ["ea-stats", "/ea"], ["tools-pinned", "/tools"],
]

const chrome = findLocalChrome()
if (!chrome) { console.error("no local Chrome found"); process.exit(1) }
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, args: ["--no-sandbox"] })
for (const theme of ["light", "dark"]) {
  for (const [name, path] of PAGES) {
    // A fresh context per shot: pages in one browser share localStorage, so a
    // stored choice would otherwise leak between shots.
    const ctx = await browser.createBrowserContext()
    const page = await ctx.newPage()
    await page.setViewport({ width: 1280, height: 1000 })
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }])
    try {
      await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 60000 })
      await new Promise(r => setTimeout(r, 700))
      await page.screenshot({ path: `${OUT}/${name}-${theme}.png`, fullPage: false })
      console.log(`  ${OUT}/${name}-${theme}.png`)
    } catch (e) {
      console.log(`  ERR ${path} — ${e.message.slice(0, 70)}`)
    }
    await ctx.close()
  }
}
await browser.close()
console.log(`\nwrote ${PAGES.length * 2} shots to ${OUT}/`)
