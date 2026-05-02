// Forces Facebook to re-scrape every URL in sitemap.xml.
// Sequential with delay + exponential backoff to avoid (#4) rate limits.
// Resumable: writes done URLs to .fb-rescrape-state.json so reruns skip them.
//
// Usage:  FB_APP_SECRET=<secret> node scripts/refresh-fb-cache.mjs
// Reset:  rm .fb-rescrape-state.json   (force re-scrape of everything)

import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const APP_ID        = '1949886389746807'
const APP_SECRET    = process.env.FB_APP_SECRET
const SITEMAP       = 'https://www.laoforextrader.com/sitemap.xml'
const STATE_FILE    = '.fb-rescrape-state.json'
const DELAY_MS      = 1500
const MAX_RETRIES   = 6
const HOST_REWRITE  = { from: 'https://laoforextrader.com', to: 'https://www.laoforextrader.com' }

if (!APP_SECRET) {
  console.error('ERROR: FB_APP_SECRET env var is required.')
  console.error('Get it at https://developers.facebook.com/apps/' + APP_ID + '/settings/basic/')
  process.exit(1)
}

const accessToken = `${APP_ID}|${APP_SECRET}`

const sleep = ms => new Promise(r => setTimeout(r, ms))

function loadState() {
  if (!existsSync(STATE_FILE)) return { done: [] }
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')) }
  catch { return { done: [] } }
}
function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
}

async function fetchSitemap() {
  const xml  = await (await fetch(SITEMAP)).text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  return urls.map(u => u === HOST_REWRITE.from || u.startsWith(HOST_REWRITE.from + '/')
    ? u.replace(HOST_REWRITE.from, HOST_REWRITE.to)
    : u)
}

async function rescrapeOnce(url) {
  const endpoint = `https://graph.facebook.com/v21.0/?id=${encodeURIComponent(url)}&scrape=true&access_token=${encodeURIComponent(accessToken)}`
  const res  = await fetch(endpoint, { method: 'POST' })
  const data = await res.json().catch(() => null)
  if (res.ok) return { ok: true }
  const code   = data?.error?.code
  const msg    = data?.error?.message || `HTTP ${res.status}`
  const isRate = code === 4 || code === 17 || code === 32 || res.status === 429
  return { ok: false, msg, isRate }
}

async function rescrapeWithBackoff(url) {
  let waitMs = 30_000
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const r = await rescrapeOnce(url)
    if (r.ok) return { ok: true }
    if (!r.isRate) return { ok: false, msg: r.msg }
    console.log(`     rate-limited, sleeping ${Math.round(waitMs / 1000)}s (attempt ${attempt}/${MAX_RETRIES})`)
    await sleep(waitMs)
    waitMs = Math.min(waitMs * 2, 300_000)
  }
  return { ok: false, msg: 'rate-limited after retries' }
}

const allUrls = await fetchSitemap()
const state   = loadState()
const doneSet = new Set(state.done)
const todo    = allUrls.filter(u => !doneSet.has(u))

console.log(`Sitemap: ${allUrls.length}  |  already done: ${doneSet.size}  |  to scrape: ${todo.length}`)
console.log(`Delay: ${DELAY_MS}ms between requests, exponential backoff on (#4)\n`)

let okCount = 0
let errCount = 0
const errors = []

for (const url of todo) {
  process.stdout.write(`-> ${url}  `)
  const r = await rescrapeWithBackoff(url)
  if (r.ok) {
    console.log('[OK]')
    okCount++
    state.done.push(url)
    saveState(state)
  } else {
    console.log(`[ERR] ${r.msg}`)
    errCount++
    errors.push({ url, msg: r.msg })
  }
  await sleep(DELAY_MS)
}

console.log(`\nDone. ${okCount} OK, ${errCount} errors. State saved to ${STATE_FILE}.`)
if (errors.length) {
  console.log('\nErrors:')
  errors.forEach(e => console.log(`  ${e.url} — ${e.msg}`))
  console.log(`\nRerun the same command to retry only failed URLs.`)
  process.exit(1)
}
