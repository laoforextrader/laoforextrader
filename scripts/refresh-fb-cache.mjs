// Forces Facebook to re-scrape every URL in sitemap.xml.
// Sequential + delay + exponential backoff + X-App-Usage tracking.
// Resumable: saves done URLs to .fb-rescrape-state.json so reruns skip them.
//
// Usage:  FB_APP_SECRET=<secret> node scripts/refresh-fb-cache.mjs
// Reset:  rm .fb-rescrape-state.json   (force re-scrape of everything)

import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const APP_ID        = '1949886389746807'
const APP_SECRET    = process.env.FB_APP_SECRET
const SITEMAP       = 'https://www.laoforextrader.com/sitemap.xml'
const STATE_FILE    = '.fb-rescrape-state.json'
const DELAY_MS      = 2_000
const MAX_RETRIES   = 5
const MAX_BACKOFF   = 30 * 60_000           // 30 min cap per attempt
const QUOTA_BAILOUT = 90                    // bail when X-App-Usage call_count >= 90
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

function parseUsage(headerValue) {
  if (!headerValue) return null
  try { return JSON.parse(headerValue) } catch { return null }
}

async function fetchSitemap() {
  const xml  = await (await fetch(SITEMAP)).text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  const rewritten = urls.map(u => u === HOST_REWRITE.from || u.startsWith(HOST_REWRITE.from + '/')
    ? u.replace(HOST_REWRITE.from, HOST_REWRITE.to)
    : u)
  return [...new Set(rewritten)]
}

async function rescrapeOnce(url) {
  const endpoint = `https://graph.facebook.com/v21.0/?id=${encodeURIComponent(url)}&scrape=true&access_token=${encodeURIComponent(accessToken)}`
  const res = await fetch(endpoint, { method: 'POST' })
  const data = await res.json().catch(() => null)
  const usage = parseUsage(res.headers.get('x-app-usage'))
  if (res.ok) return { ok: true, usage }
  const code   = data?.error?.code
  const msg    = data?.error?.message || `HTTP ${res.status}`
  const isRate = code === 4 || code === 17 || code === 32 || res.status === 429
  return { ok: false, msg, isRate, usage }
}

async function rescrapeWithBackoff(url) {
  let waitMs = 60_000
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const r = await rescrapeOnce(url)
    if (r.usage) {
      const u = r.usage
      const pct = Math.max(u.call_count ?? 0, u.total_time ?? 0, u.total_cputime ?? 0)
      if (pct >= QUOTA_BAILOUT) {
        return { ok: false, msg: `quota near full (${pct}%) — bailing out`, bail: true, usage: u }
      }
    }
    if (r.ok) return { ok: true, usage: r.usage }
    if (!r.isRate) return { ok: false, msg: r.msg, usage: r.usage }
    console.log(`     rate-limited, sleeping ${Math.round(waitMs / 1000)}s (attempt ${attempt}/${MAX_RETRIES})`)
    await sleep(waitMs)
    waitMs = Math.min(waitMs * 2, MAX_BACKOFF)
  }
  return { ok: false, msg: 'rate-limited after retries' }
}

const allUrls = await fetchSitemap()
const state   = loadState()
const doneSet = new Set(state.done)
const todo    = allUrls.filter(u => !doneSet.has(u))

console.log(`Sitemap: ${allUrls.length}  |  already done: ${doneSet.size}  |  to scrape: ${todo.length}`)
console.log(`Delay: ${DELAY_MS}ms, backoff cap: ${MAX_BACKOFF / 60_000}min, quota bailout: ${QUOTA_BAILOUT}%\n`)

let okCount = 0
let errCount = 0
const errors = []
let lastUsage = null

for (const url of todo) {
  process.stdout.write(`-> ${url}  `)
  const r = await rescrapeWithBackoff(url)
  if (r.usage) lastUsage = r.usage
  if (r.ok) {
    const u = r.usage
    const usageStr = u ? ` [call=${u.call_count ?? '?'}% time=${u.total_time ?? '?'}% cpu=${u.total_cputime ?? '?'}%]` : ''
    console.log('[OK]' + usageStr)
    okCount++
    state.done.push(url)
    saveState(state)
  } else {
    console.log(`[ERR] ${r.msg}`)
    errCount++
    errors.push({ url, msg: r.msg })
    if (r.bail) break
  }
  await sleep(DELAY_MS)
}

console.log(`\nDone. ${okCount} OK, ${errCount} errors. State saved to ${STATE_FILE}.`)
if (lastUsage) {
  console.log(`Last X-App-Usage: call=${lastUsage.call_count}% time=${lastUsage.total_time}% cpu=${lastUsage.total_cputime}%`)
}
if (errors.length) {
  console.log('\nErrors:')
  errors.forEach(e => console.log(`  ${e.url} — ${e.msg}`))
  console.log(`\nRerun the same command later to retry only failed URLs.`)
  process.exit(1)
}
