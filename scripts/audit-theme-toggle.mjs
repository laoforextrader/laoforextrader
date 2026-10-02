// Behavioural check for the light/dark switch: does the OS default apply, does
// the button flip and persist, does the choice survive navigation and outrank
// the OS afterwards, and does the pre-paint script avoid a flash of the wrong
// theme? Also fails on any React hydration warning, since ThemeScript mutates
// <html> before hydration and that is exactly where one would show up.
//
//   node scripts/audit-theme-toggle.mjs [--base http://localhost:3000]
import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"

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

const state = () => ({
  dark: document.documentElement.classList.contains("dark"),
  stored: (() => { try { return localStorage.getItem("lft-theme") } catch { return "?" } })(),
  bodyBg: getComputedStyle(document.body).backgroundColor,
  pinned: !!document.querySelector("[data-force-light]"),
})

let fails = 0
const check = (name, ok, detail = "") => {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${detail ? `  — ${detail}` : ""}`)
  if (!ok) fails++
}

const chrome = findLocalChrome()
if (!chrome) { console.error("no local Chrome found"); process.exit(1) }
const browser = await puppeteer.launch({ executablePath: chrome, args: ["--no-sandbox"] })

// Pages in one browser SHARE localStorage for an origin, so each scenario gets
// its own context — otherwise a stored choice from an earlier scenario silently
// decides the next one, which is exactly what made this script lie the
// first time it ran.
async function freshPage(os) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: os }])
  return { page, done: () => ctx.close() }
}

// ── 1. first visit with no stored choice follows the OS ──
for (const os of ["dark", "light"]) {
  const { page, done } = await freshPage(os)
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" })
  const s = await page.evaluate(state)
  check(`first visit, OS=${os} → ${os}`, s.dark === (os === "dark") && s.stored === null,
        `html.dark=${s.dark} stored=${s.stored} body=${s.bodyBg}`)
  await done()
}

// ── 2. the button flips the theme, stores the choice, and beats the OS after ──
{
  const { page, done } = await freshPage("light")
  const warnings = []
  page.on("console", m => {
    const t = m.text()
    if (/hydrat|did not match|Warning:/i.test(t)) warnings.push(t.slice(0, 160))
  })
  page.on("pageerror", e => warnings.push("pageerror: " + e.message.slice(0, 160)))

  await page.goto(BASE + "/", { waitUntil: "networkidle2" })
  const before = await page.evaluate(state)

  await page.waitForSelector(".theme-toggle", { timeout: 10000 })
  await page.click(".theme-toggle")
  await new Promise(r => setTimeout(r, 250))
  const after = await page.evaluate(state)
  check("click toggles light → dark", !before.dark && after.dark,
        `${before.bodyBg} → ${after.bodyBg}`)
  check("choice is persisted", after.stored === "dark", `stored=${after.stored}`)

  // the stored choice must win over an OS that says otherwise
  await page.goto(BASE + "/news", { waitUntil: "domcontentloaded" })
  const nav = await page.evaluate(state)
  check("choice survives navigation and outranks OS=light", nav.dark && nav.stored === "dark",
        `html.dark=${nav.dark}`)

  // and the icon swap must follow, with exactly one icon visible
  const icons = await page.evaluate(() => {
    const b = document.querySelector(".theme-toggle")
    const vis = [...b.querySelectorAll("svg")].filter(s => getComputedStyle(s).display !== "none")
    return vis.length
  })
  check("exactly one icon visible", icons === 1, `${icons} visible`)

  // click back
  await page.click(".theme-toggle")
  await new Promise(r => setTimeout(r, 200))
  const back = await page.evaluate(state)
  check("click toggles dark → light", !back.dark && back.stored === "light", `stored=${back.stored}`)

  check("no hydration warnings or page errors", warnings.length === 0, warnings.join(" | "))
  await done()
}

// ── 3. no flash: the very first paint already carries the right background ──
{
  const { page, done } = await freshPage("dark")
  // Freeze JS *after* the pre-paint script by blocking hydration bundles: the
  // inline ThemeScript still runs, so html.dark must already be set.
  await page.setRequestInterception(true)
  page.on("request", r => (/_next\/static\/chunks\/(main|webpack|app)/.test(r.url()) ? r.abort() : r.continue()))
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" }).catch(() => {})
  const s = await page.evaluate(state)
  check("dark applied with hydration bundles blocked (no flash)", s.dark,
        `html.dark=${s.dark} body=${s.bodyBg}`)
  await done()
}

// ── 4. light-pinned routes stay light even with dark chosen ──
{
  const { page, done } = await freshPage("dark")
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" })
  // /admin is omitted: it redirects to /login when unauthenticated, so its
  // ForceLight marker never renders here. It uses the identical layout as
  // these two.
  for (const path of ["/tools", "/tools/lot-calculator", "/signal/trs-signal-pro/payment"]) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" }).catch(() => {})
    const s = await page.evaluate(state)
    const light = s.bodyBg === "rgb(237, 238, 242)"
    check(`${path} pinned light under OS=dark`, s.pinned && light,
          `marker=${s.pinned} body=${s.bodyBg}`)
  }
  // and a normal route right after is dark again
  await page.goto(BASE + "/news", { waitUntil: "domcontentloaded" })
  const s = await page.evaluate(state)
  check("/news still dark after visiting a pinned route", s.dark && !s.pinned, `body=${s.bodyBg}`)
  await done()
}

await browser.close()
console.log(`\n${fails === 0 ? "PASS — all theme behaviour checks" : `${fails} check(s) FAILED`}`)
process.exit(fails === 0 ? 0 : 1)
