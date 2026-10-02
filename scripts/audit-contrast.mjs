// Dark-mode readability audit against a REAL render.
//
// Static greps can't tell you what a piece of text actually sits on — the
// background usually comes from an ancestor, and the colour may be inherited
// through several layers. This loads each page in a headless Chrome with the
// theme forced, then for every text node resolves the computed colour and
// walks up for the first opaque background, and scores the pair.
//
//   node scripts/audit-contrast.mjs [--theme dark|light] [--base http://localhost:3000]
//
// Exits non-zero if anything fails the WCAG AA floor for its text size.
import puppeteer from "puppeteer-core"
import { existsSync } from "node:fs"

const args = process.argv.slice(2)
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d }
const THEME = argOf("--theme", "dark")
const BASE = argOf("--base", "http://localhost:3000")

const PAGES = [
  "/", "/news", "/education", "/lessons", "/analysis", "/broker", "/quiz",
  "/ea-system", "/ea-system/sgrid-download", "/ea-system/abs-backtest",
  "/ea", "/ea-tools", "/about", "/contact", "/privacy", "/search?q=forex",
  "/signal/trs-signal-pro", "/login", "/unsubscribe",
  // light-pinned, checked so the pin is proven to hold
  "/tools", "/tools/lot-calculator",
]

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

// Runs in the page. Kept self-contained — it is stringified by Puppeteer.
const COLLECT = () => {
  const srgb = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255)
  const parse = (s) => {
    const m = s && s.match(/rgpa?b?a?\(|rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(",").map(Number)
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 }
  }
  const ratio = (a, b) => {
    const la = lum(a), lb = lum(b)
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
  }
  // Flatten a translucent colour over what is behind it.
  const over = (fg, bg) => fg.rgb.map((c, i) => c * fg.a + bg[i] * (1 - fg.a))

  function backdrop(el) {
    let n = el
    const stack = []
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n)
      const bg = parse(cs.backgroundColor)
      // A background image (gradient, photo) makes the pair unknowable.
      if (cs.backgroundImage && cs.backgroundImage !== "none") return { unknown: true }
      if (bg && bg.a > 0) {
        stack.push(bg)
        if (bg.a >= 0.99) break
      }
      n = n.parentElement
    }
    let base = [255, 255, 255]
    const htmlBg = parse(getComputedStyle(document.documentElement).backgroundColor)
    if (htmlBg && htmlBg.a > 0) base = htmlBg.rgb
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base)
    return { rgb: base }
  }

  const out = []
  const seen = new Set()
  for (const el of document.querySelectorAll("body *")) {
    // only elements that render their own text
    const own = Array.from(el.childNodes)
      .filter(n => n.nodeType === 3 && n.textContent.trim())
      .map(n => n.textContent.trim()).join(" ")
    if (!own) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    const fg = parse(cs.color)
    if (!fg || fg.a === 0) continue
    const bd = backdrop(el)
    if (bd.unknown) continue
    const fgFlat = over(fg, bd.rgb)
    const cr = ratio(fgFlat, bd.rgb)
    const px = parseFloat(cs.fontSize)
    const bold = parseInt(cs.fontWeight, 10) >= 700
    const large = px >= 24 || (bold && px >= 18.66)
    const floor = large ? 3 : 4.5
    if (cr < floor) {
      const key = `${cs.color}|${cs.fontSize}|${own.slice(0, 24)}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({
        text: own.slice(0, 46), tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 40),
        color: cs.color, bg: `rgb(${bd.rgb.map(Math.round).join(",")})`,
        px, bold, ratio: +cr.toFixed(2), floor,
      })
    }
  }
  return out
}

const chrome = findLocalChrome()
if (!chrome) { console.error("no local Chrome found"); process.exit(1) }

const browser = await puppeteer.launch({
  executablePath: chrome,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
})

let failures = 0
const agg = new Map()   // distinct colour pair -> count, worst ratio, a sample
for (const path of PAGES) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  // Drive the DEFAULT path — no stored preference, follow the OS — because
  // that is what a first-time reader gets. (localStorage can't be seeded
  // before the first navigation to an origin, and seeding it would only
  // exercise the explicit-choice branch, which is checked separately.)
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: THEME },
  ])
  try {
    await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 45000 })
    await new Promise(r => setTimeout(r, 450))
    const forced = await page.evaluate(() => ({
      dark: document.documentElement.classList.contains("dark"),
      pinned: !!document.querySelector("[data-force-light]"),
      bg: getComputedStyle(document.body).backgroundColor,
    }))
    const bad = await page.evaluate(COLLECT)
    const effective = forced.dark && !forced.pinned ? "dark" : "light"
    const tag = forced.pinned ? " [light-pinned]" : ""
    if (bad.length === 0) {
      console.log(`  ok   ${path.padEnd(32)} ${effective}${tag}  body ${forced.bg}`)
    } else {
      failures += bad.length
      console.log(`  FAIL ${path.padEnd(32)} ${effective}${tag}  ${bad.length} issue(s)`)
      for (const b of bad) {
        const k = `${b.color}|${b.bg}|${b.px}px${b.bold ? " bold" : ""}`
        const e = agg.get(k) ?? { n: 0, ratio: b.ratio, floor: b.floor, sample: `${b.tag}.${b.cls} "${b.text}"`, pages: new Set() }
        e.n++; e.ratio = Math.min(e.ratio, b.ratio); e.pages.add(path)
        agg.set(k, e)
      }
      for (const b of bad.slice(0, 2)) {
        console.log(`        ${b.ratio}:1 (need ${b.floor})  ${b.px}px${b.bold ? " bold" : ""}  ${b.color} on ${b.bg}`)
        console.log(`           <${b.tag}${b.cls ? ` class="${b.cls}"` : ""}>  "${b.text}"`)
      }
      if (bad.length > 2) console.log(`        … ${bad.length - 2} more (see summary)`)
    }
  } catch (e) {
    console.log(`  ERR  ${path} — ${e.message.slice(0, 90)}`)
  } finally {
    await page.close()
  }
}
await browser.close()

console.log(`\n──── distinct colour pairs below their AA floor (${THEME}) ────`)
const rows = [...agg.entries()].sort((a, b) => a[1].ratio - b[1].ratio)
for (const [k, e] of rows) {
  const [color, bg, size] = k.split("|")
  console.log(`  ${e.ratio.toFixed(2)}:1 / need ${e.floor}  ${size.padEnd(10)} ${color} on ${bg}`)
  console.log(`     x${e.n} across ${e.pages.size} page(s)   e.g. <${e.sample}`)
}
console.log(`\n${failures === 0 ? "PASS" : `${failures} failure(s), ${rows.length} distinct pair(s)`} in ${THEME} mode`)
process.exit(failures === 0 ? 0 : 1)
